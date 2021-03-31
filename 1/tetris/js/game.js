let tetrisCVS = document.getElementById("canvas");
let nextFiguresCVS = document.getElementById("nextCanvas");
let scoreHTML =  document.getElementById("Score");
let levelHTML = document.getElementById("Level");

let nextFiguresCTX = nextFiguresCVS.getContext("2d");
let tetrisCTX = tetrisCVS.getContext("2d");

let windowWidth = tetrisCVS.width;
let windowHeight = tetrisCVS.height;

let sqLen = 30;
let sqCntH = windowHeight/sqLen;
let sqCntW = windowWidth/sqLen;

let speed = 250;
let score = 0;
let nextLevelScore = 1300;

let field = [];

let yFigureOffset = 0;
let xFigureOffset = 0;

let figure = [[[0, 0, 0, 0],
               [1, 1, 1, 1],
               [0, 0, 0, 0],
               [0, 0, 0, 0]],

              [[1, 1, 0, 0],
               [1, 1, 0, 0],
               [0, 0, 0, 0],
               [0, 0, 0, 0]],

              [[1, 0, 0, 0],
               [1, 1, 1, 0],
               [0, 0, 0, 0],
               [0, 0, 0, 0]],

              [[0, 0, 1, 0],
               [1, 1, 1, 0],
               [0, 0, 0, 0],
               [0, 0, 0, 0]],

              [[0, 1, 1, 0],
               [1, 1, 0, 0],
               [0, 0, 0, 0],
               [0, 0, 0, 0]],

              [[0, 1, 0, 0],
               [1, 1, 1, 0],
               [0, 0, 0, 0],
               [0, 0, 0, 0]],

              [[1, 1, 0, 0],
               [0, 1, 1, 0],
               [0, 0, 0, 0],
               [0, 0, 0, 0]]
    ];
figure.height = [1, 2, 2, 2, 2, 2, 2];
figure.width =  [4, 2, 3, 3, 3, 3, 3];
figure.colors = [1, 2, 3, 4, 5, 6, 7];

let curInd;
let intervalId;

let nextFigures = [];

let d = {
    0 : 'rgb(255, 255, 255)',
    1 : 'rgb(6,246,198)',
    2 : 'rgb(227,243,4)',
    3 : 'rgb(5,23,112)',
    4 : 'rgb(250,92,7)',
    5 : 'rgb(76,255,0)',
    6 : 'rgb(72,1,245)',
    7 : 'rgb(255,0,0)'
}

document.body.onkeydown = function (ev)
{
    if (ev.code === 'ArrowRight') {
        xFigureOffset += 1;
        if (hasCollision())
            xFigureOffset -= 1;
    }
    if (ev.code === 'ArrowLeft') {
        xFigureOffset -= 1;
        if (hasCollision())
            xFigureOffset += 1;
    }
    if (ev.code === 'ArrowUp')
    {
        let rotated = rotate();
        if (!hasCollision(rotated))
            figure[curInd] = rotated;
    }
    if (ev.code === 'ArrowDown')
        nextStep();

    repaintBG();
    drawFigure();

}

function newGame()
{
    initField();
    initNextFigures();
    repaintBG();
    randomizeFigure();
    nextStep();
}

function initNextFigures()
{
    nextFigures = [Math.floor(Math.random() * figure.length),
        Math.floor(Math.random() * figure.length),
        Math.floor(Math.random() * figure.length)];
}

function initField()
{
    for (let i = 0; i < sqCntH; ++i) {
        let tmp = []
        for (let j = 0; j < sqCntW; ++j)
            tmp[j] = 0;
        field[i] = tmp;
    }
}

function repaintBG()
{
    tetrisCTX.clearRect(0, 0, windowWidth, windowHeight);

    for (let i = 0; i < 20; ++i)
    {
        for (let j = 0; j < 10; ++j)
        {
            tetrisCTX.fillStyle = d[field[i][j]];
            tetrisCTX.fillRect(j * sqLen, i * sqLen, sqLen, sqLen);
            tetrisCTX.strokeStyle = 'rgb(64,59,59)';
            tetrisCTX.strokeRect(j * sqLen, i * sqLen, sqLen, sqLen);
        }
    }
}

function randomizeFigure()
{
    curInd = nextFigures[0];

    for (let i = 0; i < nextFigures.length - 1; ++i)
        nextFigures[i] = nextFigures[i + 1];
    nextFigures[nextFigures.length - 1] = Math.floor(Math.random() * figure.length);

    nextFiguresCTX.clearRect(0, 0, nextFiguresCVS.width, nextFiguresCVS.height);
    drawNextFigures();

    xFigureOffset = sqCntW / 2 - Math.floor(figure.width[curInd] / 2);
}

function nextStep()
{
    if (hasCollision())
    {
        clearTimeout(intervalId);
        showGameOver();
        setTimeout(reformLocalStorage, 2000);
        return;
    }

    repaintBG();
    drawFigure();

    ++yFigureOffset;
    if (hasCollision()) {
        --yFigureOffset;
        fixateFigure();
    }
}

function drawFigure()
{
    let i;
    let j = 0;

    for (i = 0; i < 4; ++i) {
        for (j = 0; j < 4; ++j) {
            if (figure[curInd][i][j] === 1) {
                tetrisCTX.fillStyle = d[figure.colors[curInd]];
                tetrisCTX.fillRect  ((j + xFigureOffset) * sqLen, (i + yFigureOffset) * sqLen, sqLen, sqLen);
                tetrisCTX.strokeStyle = 'rgb(0,0,0)';
                tetrisCTX.strokeRect((j + xFigureOffset) * sqLen, (i + yFigureOffset) * sqLen, sqLen, sqLen);
            }
        }
    }
}

function drawNextFigures()
{
    let margin = 0;
    let i = 0;
    let j = 0;
    let ind;

    for (ind = 0; ind < nextFigures.length; ++ind)
    {
        for (i = 0; i < 4; ++i) {
            for (j = 0; j < 4; ++j) {
                if (figure[nextFigures[ind]][i][j] === 1) {
                    nextFiguresCTX.fillStyle = d[figure.colors[nextFigures[ind]]];
                    nextFiguresCTX.fillRect  ( (j + 1) * sqLen, (i + margin) * sqLen, sqLen, sqLen);
                    nextFiguresCTX.strokeStyle = 'rgb(0,0,0)';
                    nextFiguresCTX.strokeRect((j + 1) * sqLen, (i + margin) * sqLen, sqLen, sqLen);
                }
            }
        }
        margin += 5;
    }
}

function fixateFigure()
{
    let i;
    let j = 0;

    for (i = yFigureOffset; i < yFigureOffset + 4; ++i)
    {
        for (j = xFigureOffset; j < xFigureOffset + 4; ++j) {
            if (figure[curInd][i - yFigureOffset][j - xFigureOffset] === 1)
                field[i][j] = figure.colors[curInd];
        }
    }
    findFullRows();
    randomizeFigure();

    yFigureOffset = 0;
}

function hasCollision(curr = figure[curInd])
{
    let i;
    let j = 0;

    for (i = 0; i < 4; ++i)
        for (j = 0; j < 4; ++j)
            if ((curr[i][j] === 1 && (xFigureOffset + j < 0 || yFigureOffset + i > sqCntH - 1
                                                                      || xFigureOffset + j > sqCntW - 1)) ||
                (curr[i][j] === 1 && field[i + yFigureOffset][j + xFigureOffset] !== 0))
                return true;


    return false;
}

function findFullRows()
{
    let i;
    let j = 0;

    let isFull;
    let fullCnt = 0;

    for (i = 0; i < field.length; ++i)
    {
        isFull = true;
        for (j = 0; j < field[i].length; ++j)
        {
            if (field[i][j] === 0)
                isFull = false;
        }

        if (isFull === true) {
            deleteRow(i);
            ++fullCnt;
        }
    }

    calculateScore(fullCnt);
}

function calculateScore(fullCnt)
{
    switch (fullCnt)
    {
        case 1:
            score += 100;
            break;
        case 2:
            score += 300;
            break;
        case 3:
            score += 700;
            break;
        case 4:
            score += 1500;
            break;

    }

    let zeroString = "";
    for (let i = 0; i < 4 - score.toString().length; ++i)
        zeroString += "0";

    scoreHTML.textContent = "Score " + zeroString + score.toString();

    calculateLevel();
}

function calculateLevel()
{
    if (score >= nextLevelScore)
    {
        let curLevel = parseInt(levelHTML.textContent[levelHTML.textContent.length - 1]);
        if (curLevel === 0)
            return;

        nextLevelScore *= 2;

        clearInterval(intervalId);
        speed -= 25;
        intervalId = setInterval(nextStep, speed);

        levelHTML.textContent = "Level " + (curLevel + 1).toString();
    }


}

function deleteRow(ind)
{
    let i;
    let j = 0;
    for (i = ind; i > 0; --i)
    {
        for (j = 0; j < field[i].length; ++j)
            field[i][j] = field[i - 1][j];
    }

    for (j = 0; j < field[ind - 1]; ++j)
        field[ind - 1][j] = 0;
}

function rotate() {
    let save = [];
    for (let i = 0; i < 4; ++i) {
        save[i] = []
        for (let j = 0; j < 4; ++j)
            save[i][j] = 0;
    }

    let maxDimension = Math.max(figure.height[curInd], figure.width[curInd]);

    for (let i = 0; i < maxDimension; ++i)
        for (let j = 0; j < maxDimension; ++j)
            save[i][j] = figure[curInd][maxDimension - 1 - j][i];

    return save;
}

function showGameOver()
{
    let header = document.getElementById("GAMEOVER");
    header.textContent = "G A M E O V E R"
}

function reformLocalStorage() {
    let userName = localStorage['user-name'];
    localStorage.removeItem('user-name');

    for (let i = 0; i < localStorage.length; ++i)
        if (localStorage.key(i) === userName)
        {
            if (localStorage[i] < score)
                localStorage[i] = score;
            setNewLocation();
            return;
        }

    if (localStorage.length < 4) {
        localStorage[userName] = score;
        setNewLocation();
        return;
    }


    let min = {
        nickname: "player",
        score: -1
    };

    for (let i = 0; i < localStorage.length; ++i) {
        let curScore = parseInt(localStorage[localStorage.key(i)]);
        if (min.score === -1 || min.score > curScore) {
            min.score = curScore;
            min.nickname = localStorage.key(i);
        }
    }

    if (min.score < score) {
        localStorage.removeItem(min.nickname);
        localStorage[userName] = score;
    }

    setTimeout(setNewLocation, 10000)
}

function setNewLocation()
{
    document.location.href = "Leaderboard.html";
}

intervalId = setInterval(nextStep, speed);
newGame();


