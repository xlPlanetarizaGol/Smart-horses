
let environment = [];
let scorePlayer = 0;
let scoreIA = 0;
let depth = 0;
let playerPos = [];
let iaPos = [];
let turn = "IA";
let isFinish = false;

const start = document.getElementById("start");

start.addEventListener("click", function (e) {
    loadGame();
})


/**
 * Carga el juego
 */
function loadGame() {
    document.getElementById("start").disabled = true;

    let difficulty = document.getElementById("dificultad");
    depth = parseInt(difficulty.value);
    difficulty.disabled = true;
    
    let html = "";
    let randomPosX = [0, 1, 2, 3, 4, 5, 6, 7].sort(function () { return Math.random() - 0.5 });
    let randomPosY = [0, 1, 2, 3, 4, 5, 6, 7].sort(function () { return Math.random() - 0.5 });
    iaPos.push(randomPosX[7], randomPosY[7]);

    playerPos = generateRandomPosPlayer(randomPosX, randomPosY);

    for (let i = 0; i < 8; i++) {
        html += "<tr>";
        environment.push([]);
        for (let j = 0; j < 8; j++) {
            let emptyCell = true;
            for (let k = 0; k < randomPosX.length - 1; k++) {
                if (randomPosX[k] == i && randomPosY[k] == j) {
                    html += `<td id="pos${i}-${j}"><h2>${k + 1}</h2></td>`;
                    emptyCell = false;
                    environment[i].push(k + 1);
                    break;
                }
            }
            if (randomPosX[7] == i && randomPosY[7] == j) {
                html += `<td id="pos${i}-${j}"><img src="img/caballo blanco.png" width="50px" height="50px"></td>`;
                environment[i].push(8);
                emptyCell = false;
            }
            if (playerPos[0] == i && playerPos[1] == j) {
                html += `<td id="pos${i}-${j}"><img src="img/caballo negro.jpg" width="50px" height="50px"></td>`;
                environment[i].push(9);
                emptyCell = false;
            }
            if (emptyCell) {
                environment[i].push(0);
                html += `<td id="pos${i}-${j}"></td>`;
            }

        }
        html += "</tr>";
    }
    document.getElementById("game").innerHTML = html;
    document.querySelectorAll("td").forEach(el => {
        el.addEventListener("click", function (e) {
            if (turn == "player" && !isFinish) {
                let id;
                if (e.target.localName == "h2") {
                    id = e.target.parentElement.id;
                } else {
                    id = e.target.id;
                }
                let play = id.replace("pos", "").split("-").map(el => parseInt(el));
                executePlayPlayer(play);
            }
        })
    });
    document.getElementById("turn").style = "display: block;"
    setTimeout(() => {
        const result = max(iaPos, playerPos, 0, 0);
        executePlayIA(result[2]);
        document.getElementById("turn").innerText = "Turno: Player";
    }, 2000);
}



/**
 * Ejecuta la jugada del jugador
 */
function executePlayPlayer(play) {
    let moves = getValidMoves(playerPos, 8);
    let isMoved = false;
    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        if (move[0] == play[0] && move[1] == play[1]) {
            isMoved = true;
            scorePlayer += environment[play[0]][play[1]];
            environment[play[0]][play[1]] = 9;
            environment[playerPos[0]][playerPos[1]] = 0;
            document.getElementById(`pos${playerPos[0]}-${playerPos[1]}`).innerHTML = "";
            playerPos = play;
            document.getElementById(`pos${playerPos[0]}-${playerPos[1]}`).innerHTML = `<img src="img/caballo negro.jpg" width="50px" height="50px">`;
            document.getElementById("score-player").innerText = "Player: " + scorePlayer;
            turn = "ia";
            finish();
            document.getElementById("turn").innerText = "Turno: IA";
            setTimeout(() => {
                if (!isFinish) {
                    const result = max(iaPos, playerPos, 0, 0);
                    executePlayIA(result[2]);
                    document.getElementById("turn").innerText = "Turno: Player";
                }

            }, 2000);
            break;
        }
    }
    if (!isMoved) {
        alert("Movimiento no valido");
    }
}

/**
 * Ejecuta la jugada de la IA
 */
function executePlayIA(play) {
    scoreIA += environment[play[0]][play[1]];
    environment[play[0]][play[1]] = 8;
    environment[iaPos[0]][iaPos[1]] = 0;
    document.getElementById(`pos${iaPos[0]}-${iaPos[1]}`).innerHTML = "";
    iaPos = play;
    document.getElementById(`pos${iaPos[0]}-${iaPos[1]}`).innerHTML = `<img src="img/caballo blanco.png" width="50px" height="50px">`;
    document.getElementById("score-ia").innerText = "IA: " + scoreIA;
    finish();
    turn = "player";
}

/**
 * Verifica si el juego se termino
 */
function finish() {
    for (let i = 0; i < environment.length; i++) {
        for (let j = 0; j < environment.length; j++) {
            if (environment[i][j] > 0 && environment[i][j] < 8) {
                return false;
            }
        }
    }
    if (scoreIA < scorePlayer) {
        alert("GANASTE");
    } else if (scorePlayer < scoreIA) {
        alert("PERDISTE")
    } else {
        alert("EMPATE")
    }
    isFinish = true;
}

/**
 * Genera una posicion aleatoria para el jugador
 * @param {*} randomPosX 
 * @param {*} randomPosY 
 */
function generateRandomPosPlayer(randomPosX, randomPosY) {
    let exit = false;
    let x = 0;
    let y = 0;
    while (!exit) {
        x = Math.round(Math.random() * 7);
        y = Math.round(Math.random() * 7);
        exit = true;
        for (let i = 0; i < randomPosX.length; i++) {
            if (x == randomPosX[i] && y == randomPosY[i]) {
                exit = false;
                break;
            }
        }
    }
    return [x, y];
}

function max(currentIAPos, currentPlayerPos, currentDepth, currentScore) {
    let totalScore = 0;
    let totalCost = 1;
    let selectedPlay = currentIAPos;
    if (currentDepth + 1 <= depth) {
        environment[currentIAPos[0]][currentIAPos[1]] = 0;
        getValidMoves(currentIAPos, 9).forEach(move => {
            const moveScore = environment[move[0]][move[1]];
            environment[move[0]][move[1]] = 8;
            const [score, cost] = min(move, currentPlayerPos, currentDepth + 1, moveScore);
            if (score / cost >= totalScore / totalCost) {
                totalScore = score;
                totalCost = cost;
                selectedPlay = move;
            }
            environment[move[0]][move[1]] = moveScore;
        });
        environment[currentIAPos[0]][currentIAPos[1]] = 8;
    } else {
        totalCost = 0;
    }
    return [totalScore + currentScore, totalCost + 1, selectedPlay];
}

function min(currentIAPos, currentPlayerPos, currentDepth, currentScore) {
    let totalScore = Infinity;
    let totalCost = 1;
    if (currentDepth + 1 <= depth) {
        environment[currentPlayerPos[0]][currentPlayerPos[1]] = 0;
        getValidMoves(currentPlayerPos, 8).forEach(move => {
            const moveScore = environment[move[0]][move[1]];
            environment[move[0]][move[1]] = 9;
            const [score, cost] = max(currentIAPos, move, currentDepth + 1, moveScore);
            if (score / cost <= totalScore / totalCost) {
                totalScore = score;
                totalCost = cost;
            }
            environment[move[0]][move[1]] = moveScore;
        });
        environment[currentPlayerPos[0]][currentPlayerPos[1]] = 9;
    }
    return [totalScore + currentScore, totalCost + 1];
}

/**
 * Obtiene los movimientos validos de un jugador
 * @returns 
 */
function getValidMoves(currentPos, player) {
    let moves = [];
    if (currentPos[0] - 2 >= 0 && currentPos[1] - 1 >= 0 && environment[currentPos[0] - 2][currentPos[1] - 1] != player) {
        moves.push([currentPos[0] - 2, currentPos[1] - 1])
    }
    if (currentPos[0] - 1 >= 0 && currentPos[1] - 2 >= 0 && environment[currentPos[0] - 1][currentPos[1] - 2] != player) {
        moves.push([currentPos[0] - 1, currentPos[1] - 2])
    }
    if (currentPos[0] + 1 < 8 && currentPos[1] - 2 >= 0 && environment[currentPos[0] + 1][currentPos[1] - 2] != player) {
        moves.push([currentPos[0] + 1, currentPos[1] - 2])
    }
    if (currentPos[0] + 2 < 8 && currentPos[1] + 1 < 8 && environment[currentPos[0] + 2][currentPos[1] + 1] != player) {
        moves.push([currentPos[0] + 2, currentPos[1] + 1])
    }
    if (currentPos[0] + 2 < 8 && currentPos[1] - 1 < 8 && environment[currentPos[0] + 2][currentPos[1] - 1] != player) {
        moves.push([currentPos[0] + 2, currentPos[1] - 1])
    }
    if (currentPos[0] + 1 < 8 && currentPos[1] + 2 < 8 && environment[currentPos[0] + 1][currentPos[1] + 2] != player) {
        moves.push([currentPos[0] + 1, currentPos[1] + 2])
    }
    if (currentPos[0] - 1 >= 0 && currentPos[1] + 2 < 8 && environment[currentPos[0] - 1][currentPos[1] + 2] != player) {
        moves.push([currentPos[0] - 1, currentPos[1] + 2])
    }
    if (currentPos[0] - 2 >= 0 && currentPos[1] + 1 < 8 && environment[currentPos[0] - 2][currentPos[1] + 1] != player) {
        moves.push([currentPos[0] - 2, currentPos[1] + 1])
    }
    return moves;
}
