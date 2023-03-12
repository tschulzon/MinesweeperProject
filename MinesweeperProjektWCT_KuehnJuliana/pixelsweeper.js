//eine Klasse fuer das jeweilige einzelne Feld mit folgenden Eigenschaften
class field {
    constructor(id, xID, yID, checkMine, checkOpen, checkFlag, mineNbr) {
        this.id = id;
        this.xID = xID;
        this.yID = yID;
        this.checkMine = false;
        this.checkOpen = false;
        this.checkFlag = false;
        this.bombNumber = 0;
    }
}

var gameWon = false;
var gameOver = false;

var boardSize;
var numOfMines;
var minePos;
var boardArray = [];

var getUserRow;
var getUserCol;
var getUserMines;
var flagModeOn = false;
var flagState = 0;

var minefieldCont;
var timer;
var mineCount;
var bombsLeft;
var gameTab;

var isSetTimeoutRunning = false;
var secCount = 0;

var debugState = 0;
var debugBool = false;

var x;
var y;

//Funktion gameSetup, in der das Spielfeld erzeugt und angezeigt wird
function gameSetup() { 
    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;
    getUserMines = document.getElementById("nrMines").value;
    bombsLeft = getUserMines;
    mineCount = getUserMines;

    gameTimer();
    createGameBoard();
    createMinePos();
    countNeighborBombs();
    createGameTable();
    makeFieldsClickable();
    checkIfWon();

    document.getElementById("countBombs").innerText = bombsLeft;

    console.log(boardArray);

}

//Funktion, in der das interne Spielfeld mittels Multidimensionalen Array erzeugt wird,
//als einzelnes Feld wird dann ein Objekt der Klasse genommen
function createGameBoard(getUserRow, getUserCol) {
    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;
    getUserMines = document.getElementById("nrMines").value;

    for (x = 0; x < getUserRow; x++) {
        boardArray[x] = [];
        for (y = 0; y < getUserCol; y++) {
            boardArray[x][y] = new field(x + "-"+ y, x, y, false, false, false);
        }
    }
    boardSize = getUserRow * getUserCol;
    return boardArray;
}

//In dieser Funktion werden die Felder, in denen Minen vorhanden sind, erzeugt
//und auf dem Spielfeld zufaellig verteilt solange der MinenCounter groesser 0 ist
//MinenCounter wird je um 1 reduziert wenn die Eigenschaft CheckMine auf True gesetzt wurde
function createMinePos(getUserMines) {
    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;
    getUserMines = document.getElementById("nrMines").value;

    mineCount = getUserMines;

    while (mineCount > 0) {
        x = Math.floor(Math.random() * getUserRow);
        y = Math.floor(Math.random() * getUserCol);

        if (boardArray[x][y].checkMine == false) {
            boardArray[x][y].checkMine = true;
            mineCount -= 1;
        }
        else {
            continue;
        }
    }
}

//In diesr Funktion wird die Tabelle dynamisch erstellt mittels einer for-Schleife
//die durch das boardArray, welches wir vorher erzeugt haben, durchgeht
function createGameTable() {
    document.getElementById("setupContainer").style.display = "none";
    document.getElementById("minefield").style.display = "block";

    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;

    tableCont = document.getElementById("tableContainer");

    boardSize = getUserRow * getUserCol;

    const table = document.createElement("table");
    tableCont.appendChild(table);
    table.setAttribute("id", "gameTable");

    const tableBody = document.createElement("tbody");
    table.appendChild(tableBody);

    for (var i = 0; i < boardArray.length; i++) {
        const tableRow = document.createElement("tr");
        tableBody.appendChild(tableRow);

        for (var j = 0;  j <  boardArray[i].length; j++) {
            var inputID = boardArray[i][j].id;

            var tableCell = document.createElement("td");
            tableCell.setAttribute("id", inputID);
            tableCell.classList.add("basicField");
            tableRow.appendChild(tableCell);

            table.setAttribute("border", "2");
        }
    }

}

//In dieser Funktion werden die einzelnen Felder mittels der Klasse in einer
//Variable gespeichert, die Felder werden dann in einem Array gespeichert,
//durch die iteriert wird und jedes einzelne Feld klickbar macht
function makeFieldsClickable() {
    var fields = document.getElementsByClassName("basicField");

    Array.from(fields).forEach(function (field) {
        var x = field.id.substr(0, field.id.indexOf('-'));
        var y = field.id.substr(field.id.indexOf('-') + 1);

        field.addEventListener('click', function () { openField(x,y) });
    });
}

//In dieser Funktion werden die Felder nach verschiedenen Faellen geoeffnet und die
//richtigen Images eingefuegt
function openField(x,y) {
    gameTab = document.getElementById("gameTable");
    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;
    getUserMines = document.getElementById("nrMines").value;

    var boardField = boardArray[x][y];

    //Falls der FlagMode Button nicht aktiviert ist, wird hier reingegangen bei
    //Fall 1: wenn das Feld nicht geoeffnet ist und das Feld nicht geflaggt wurde
    //Fall 2: wenn das Feld mehr als 0 Bomben um sich rum hat, wird das entsprechende Image mit
    //der richtigen Zahl eingefuegt ueber die $ Variable
    //Fall 3: wenn das Feld eine Mine ist, wird hier ein Bombem Image eingefuegt und es ist GameOver
    if (!flagModeOn) {
        if (boardField.checkOpen == false && boardField.checkFlag == false) {
            if (boardField.bombNumber == 0 && boardField.checkMine == false) {
                document.getElementById(boardField.id).style.backgroundImage = "url('css/images/openBlock.jpg')";
                document.getElementById(boardField.id).style.backgroundSize = "cover";
                boardField.checkOpen = true;
            }
            else if (boardField.bombNumber > 0) {
                document.getElementById(boardField.id).style.backgroundImage = `url('css/images/${boardField.bombNumber}.png')`;
                document.getElementById(boardField.id).style.backgroundSize = "cover";
                boardField.checkOpen = true;
            }
            else if (boardField.checkMine) {
                document.getElementById(boardField.id).style.backgroundImage = "url('css/images/BombBlock.png')";
                document.getElementById(boardField.id).style.backgroundSize = "cover";
                isGameOver(boardField);
            }
        }
        checkIfWon();
    }

    //Falls FlagMode Button aktiv ist und das Feld noch nicht geoeffnet ist
    //geht man hier rein und falls das Feld noch nicht geflaggt wurde
    //wird die Flagge gesetzt und die Bombemanzahl um 1 reduziert
    //Wenn man die Flagge wieder zuruecknehmen moechte, wird das normale
    //BlockImage eingefuegt und die Bombenanzahl wieder erhoeht
    if (flagModeOn && boardField.checkOpen == false) {
        if (!boardField.checkFlag){
            document.getElementById(boardField.id).style.backgroundImage = "url('css/images/starBlock.png')";
            document.getElementById(boardField.id).style.backgroundSize = "cover";
            boardField.checkFlag = true;
            document.getElementById("countBombs").innerText = --bombsLeft;
        }
        else {
            document.getElementById(boardField.id).style.backgroundImage = "url('css/images/block.png')";
            document.getElementById(boardField.id).style.backgroundSize = "cover";
            boardField.checkFlag = false;
            document.getElementById("countBombs").innerText = ++bombsLeft;
        }
        checkIfWon();
    }

    //Falls das Feld keine Bomben um sich herum hat und der FlagMode nicht aktiv ist
    //wird in eine Variable ein Array von nicht geoeffneten Feldern, die auch keine Bomben sind
    //gespeichert, diese Felder werden in einer extra Funktion berechnet
    //Dieses Array wird durchlaufen und fuer jeden Eintrag rekursiv
    //die openField Funktion wieder aufgerufen mit den aktuellen x und y Koordinaten
    if (boardField.bombNumber == 0 && !flagModeOn)  {
        var notBombNotOpenFields = calcnotBombNotOpenFields(boardField);

        for (var  i = 0; i < notBombNotOpenFields.length; i++)
            openField(notBombNotOpenFields[i].xID, notBombNotOpenFields[i].yID);
    }
}

//In dieser Funktion wird das Array mit den nicht geoeffneten nicht-Bomben-Feldern
//erzeugt mittels einer for-Schleife, die die umliegenen 8 Felder des
//aktuellen Feldes durchgeht
function calcnotBombNotOpenFields(boardField) {
    var notBombNotOpenFields = new Array();

    for (var checkY = -1; checkY <= 1; checkY++) {
        if (boardField.yID + checkY < 0 || boardField.yID + checkY >=  getUserRow)
        continue;
        for (var checkX = -1; checkX <= 1; checkX++) {
            if (boardField.xID + checkX < 0 ||  boardField.xID + checkX >= getUserCol || (checkX == 0 && checkY == 0))
            continue;
            if (!boardArray[boardField.xID + checkX] [boardField.yID + checkY].checkMine && !boardArray[boardField.xID + checkX][boardField.yID + checkY].checkOpen)
            notBombNotOpenFields.push(boardArray[boardField.xID + checkX][boardField.yID + checkY]);5
        }
    }
    return notBombNotOpenFields;
}

//In dieser Funktion werden auch die umliegenden 8 Felder eines aktuellen
//Feldes (welches man auch durch eine for-Schleife bekommt) mittels einer
//for-Schleife geprueft, falls es ein Bombenfeld ist, wird das ignoriert
//und weitergemacht; falls die umliegenden Felder Bombem sind, wird die
//Bombennummer hochgezaehlt
function countNeighborBombs() {
    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;

    for (var x = 0; x < getUserRow; x++) {
        for(var y = 0; y < getUserCol; y++) {
            if(boardArray[x][y].checkMine == true) {
                continue;
            }
            for (var checkX = x - 1; checkX < getUserRow && checkX <= x + 1; checkX++) {
                for (var checkY = y - 1; checkY < getUserCol && checkY <= y + 1; checkY++) {
                    if (checkX >= 0 && checkY >= 0 && boardArray[checkX][checkY].checkMine == true) {
                        boardArray[x][y].bombNumber++;
                    }
                }
            }
        }
    }
}

//Funktion fuer den DebugMode, geht mittels for-Schleife durch und checkt
//ob das Minen sind, die dann alle geoeffnet werden bei Klick auf Debug Button
function debugMode() {
    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;

    if (debugState == 0) {
        debugBool = true;
        document.getElementById("debugButton").style.backgroundColor = "rgb(86, 220, 120)";
        for (var x = 0; x < getUserRow; x++) {
            for (var y = 0; y < getUserCol; y++) {
                if(boardArray[x][y].checkMine == true) {
                    document.getElementById(boardArray[x][y].id).style.backgroundImage = "url('css/images/BombBlock.png')";
                    document.getElementById(boardArray[x][y].id).style.backgroundSize = "cover";
                }
            }
        }
        debugState = 1;
    }
    else {
        debugBool = false;
        document.getElementById("debugButton").style.backgroundColor = "rgb(255, 225, 255)";
        for (var x = 0; x < getUserRow; x++) {
            for (var y = 0; y < getUserCol; y++) {
                if (boardArray[x][y].checkMine == true) {
                    document.getElementById(boardArray[x][y].id).style.backgroundImage = "url('css/images/block.png')";
                    document.getElementById(boardArray[x][y].id).style.backgroundSize = "cover";
                }
            }
        }
        debugState = 0;
    } 
}

function flagMode() {
    if (flagState == 0) {
        flagModeOn = true;
        document.getElementById("flagButton").style.backgroundColor  = "rgb(255, 255, 0)";
        flagState = 1;
    }
    else {
        flagModeOn = false;
        document.getElementById("flagButton").style.backgroundColor = "rgb(255, 255, 255)";
        flagState = 0;
    }
}


function gameTimer() {
    
    timer = document.getElementById("timer");
    timer.innerHTML = "TIMER: " + "000";
    var interval = setInterval(function() {
        secCount++;
        if (secCount < 10)
         timer.innerHTML = "TIMER: 00" + secCount;
        else if (secCount < 100)
         timer.innerHTML = "TIMER: 0"  + secCount;
        else if (secCount < 999)
         timer.innerHTML = "TIMER: " + secCount;
        if (secCount == 999 || gameOver == true){
         clearInterval(interval);
        }   
    }, 1000);
}

function errorMessage(message) {
    document.getElementById("instruction").style.display = "none";
    document.getElementById("errorMsg").style.display = "block";
    document.getElementById("errorMsg").innerText = message;
    document.getElementById("setupContainer").style.backgroundColor = "rgba(193, 63, 11, 0.9)";
}

function winMessage() {
    document.getElementById("winMsg").style.display = "block";
    document.getElementById("win").style.display = "block";
    document.getElementById("win").innerText = "CONGRATULATIONS! YOU WON!";
}

function gameoverMessage() {
    document.getElementById("gameOverMsg").style.display = "block";
    document.getElementById("gameOver").style.display = "block";
    document.getElementById("gameOver").innerText = "OH NO! YOU LOST! PLEASE TRY AGAIN :)";
}

function checkUserInput(){
    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;
    getUserMines = document.getElementById("nrMines").value;

    boardSize = getUserRow * getUserCol;

    if (getUserRow <  8 || getUserCol < 8){
        errorMessage("------- ERROR ------- minimum of rows and columns are > 8 < Please try again");
        return false;
    }
    if (getUserRow >  32 || getUserCol > 32){
        errorMessage("------- ERROR ------- maximum of rows and columns are > 32 < Please try again");
        return false;
    }
    if (getUserMines < 1){
        errorMessage("------- ERROR ------- minimum of mines are > 1 < Please try again");
        return false;
    }
    if (getUserMines > (boardSize * 0.6)){
        errorMessage("------- ERROR ------- minimum of mines are " +
        " > 60% of the board  < Please try again");
    }
    else {
        gameSetup();
    }
}

//Spieler hat gewonnen wenn alle Bombenfelder geflaggt wurden
function checkIfWon() {
    var matches = 0;
    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;
    getUserMines = document.getElementById("nrMines").value;

    for (var x = 0; x < getUserRow; x++) {
        for (var y = 0; y < getUserCol; y++) {
            if(boardArray[x][y].checkFlag == true && boardArray[x][y].checkMine == true) {
                matches++;
            }
        }
    }
    if(matches == getUserMines) {
        winMessage();
        gameOver = true;
        return;
    }
}

//Wenn Spieler auf ein Bombenfeld klickt, wird Message GameOver angezeigt
function isGameOver(boardField) {

    getUserRow = document.getElementById("nrRows").value;
    getUserCol = document.getElementById("nrCols").value;

    for (var x = 0; x < getUserRow; x++) {
        for (var y = 0; y < getUserCol; y++) {
            if(boardArray[x][y].checkMine == true) {
                document.getElementById(boardArray[x][y].id).style.backgroundImage = "url('css/images/BombBlock.png')";
                document.getElementById(boardArray[x][y].id).style.backgroundSize = "cover";
            }
        }
    }
    gameoverMessage();
    gameOver = true;
    return;
}

function backToBegin() {
    location.reload();
    return false;
}