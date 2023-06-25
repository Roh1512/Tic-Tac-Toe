//first step, we need to attach event (submit) listener to the form to get user data

// attach event (click) listers to each "game box"

//next, initialize the game

//next, we need to check which gamemode we're playing

// we need to set win conditions

// we need to determine current player

// after each move, check win conditions and if not met, set other player as active

// human vs human, next implement easy ai, next impossible ai

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const form = document.querySelector("#myForm");
const newGameBtn = document.querySelector("#restartBtn");
const resetGameBtn = document.querySelector("#resetBtn");

newGameBtn.addEventListener('click',() => {
    location.reload()
})

form.addEventListener('submit', (e) => {
    e.preventDefault();

    //Initialize user form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    document.querySelector(".modal-wrapper").setAttribute("hidden",true);
    initiazeGame(data);
});

const initializeVariables = (data) => {
    data.choice = +data.choice;//Convert choice to number;
    data.board = [0,1,2,3,4,5,6,7,8]
    data.player1 = "X";
    data.player2 = "O";
    data.round = 0;
    data.currentPlayer = "X";
    data.gameOver = false;
}

const resetDom = () => {
    document.querySelectorAll('.box').forEach(box => {
        box.className = "box";
        box.textContent = "";
    });
}

const addEventListenersToGameBoard = (data) => {
    document.querySelectorAll('.box').forEach(box => {
        box.addEventListener('click', (e) => {
            playMove(e.target,data);
        })
    });
    resetGameBtn.addEventListener('click', () => {
        initializeVariables(data);
        resetDom();
        adjustDom("displayTurn", `${data.player1Name}'s Turn`)
    })
}

const initiazeGame = (data) => {
    //initialize game varialbles
    adjustDom("displayTurn", `${data.player1Name}'s Turn`)
    initializeVariables(data);

    addEventListenersToGameBoard(data);
    
    //Add event listeners to gameboard
}

const playMove = (box,data) => {
    //is game over - don't do anything
    if(data.gameOver || data.round > 8) {
        return;
    }
    //Check if gamebox has a letter in it if so don't do anithing
    if(data.board[box.id] === "X" && data.board[box.id] === "O"){
        return;
    }

    //Adjust the DOM for player move and then check win condition
    data.board[box.id] = data.currentPlayer;
    box.textContent = data.currentPlayer;
    box.classList.add(data.currentPlayer === "X" ? "player1" : "player2");
    //Increase the round number
    data.round++;

    //Check end conditions
    if(endConditions(data)){
        return;
    }

    //Change current player
    //Change the DOM and change data.currentPlayer
    
    if(data.choice === 0 ) {
        changePlayer(data);
    } else if(data.choice === 1) {
        //Easy AI
        easyAiMove(data);

        //Change back to player 1
        data.currentPlayer = "X";
    } else if (data.choice === 2) {
        changePlayer(data);
        impossibleAiMove(data);
        if(endConditions(data)) {
            return;
        }
        changePlayer(data);
    }
}

const endConditions = (data) => {
    //3 potental options
    //Winner Tie// game not over yet
    if(checkWinner(data,data.currentPlayer)) {
        //Adjust the DOM to reflect win
        let winTextContent = data.currentPlayer === "X" ? data.player1Name : data.player2Name;
        adjustDom("displayTurn",winTextContent + " has Won the Game");
        return true;
    }else if(data.round === 9) {
        //Adjust the DOM to reflect tie
        adjustDom("displayTurn","It's a Tie");
        data.gameOver = true;
        return true;
    }
    return false;
};

const checkWinner = (data, player) => {
    let result = false;
    winningConditions.forEach((condition) => {
        if(
            data.board[condition[0]] === player &&
            data.board[condition[1]] === player &&
            data.board[condition[2]] === player
            ){
            result = true;
        } 
    })
    return result;
}

const adjustDom = (className,textContent) => {
    const elem = document.querySelector(`.${className}`);
    elem.textContent = textContent;
}

const changePlayer = (data) => {
    data.currentPlayer = data.currentPlayer === "X" ? "O" : "X" ;
    //Adjust DOM
    let displayTurnText = data.currentPlayer === "X" ? data.player1Name : data.player2Name;
    adjustDom("displayTurn",`${displayTurnText}'s Turn`);
}

const easyAiMove = (data) => {
    changePlayer(data);
    data.round++;
    let availableSpaces = data.board.filter((space) => space !== "X" && space !== "O");
    let move = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
    data.board[move] = data.player2;
    let box = document.getElementById(`${move}`);
    setTimeout(() => {
        box.textContent = data.player2;
        box.classList.add("player2");
    },200);

    if(endConditions(data)) {
        return;
    }

    changePlayer(data);
}

const impossibleAiMove = (data) => {
    data.round++;
    //Get best possible moves from minimax
    const move = minimax(data,"O").index;
    data.board[move] = data.player2;
    let box = document.getElementById(`${move}`);
    box.textContent = data.player2;
    box.classList.add("player2");
}

const minimax = (data,player) => {
    let availableSpaces = data.board.filter((space) => space !== "X" && space !== "O");
    if(checkWinner(data, data.player1)) {
        return {
            score : -100,
        }
    }else if(checkWinner(data,data.player2)) {
        return {
            score : 100,
        }
    }else if(availableSpaces.length === 0){
        return {
            score : 0,
        }
    }
    //Check if winner, If player1 wins set score to -100
    //If tie, set score to 0
    //if(win set score to 100)

    const potentalMoves = [];
    //Loop over availableSpaces to get potential moves and check if wins
    for(let i = 0; i < availableSpaces.length; i++) {
        let move = {};
        move.index = data.board[availableSpaces[i]];
        data.board[availableSpaces[i]] = player;
        if(player === data.player2) {
            move.score = minimax(data,data.player1).score;
        }else {
            move.score = minimax(data,data.player2).score;
        }

        //Set the move to the board
        data.board[availableSpaces[i]] = move.index;
        //Push potential move to the array
        potentalMoves.push(move);
    }
    let bestMove = 0;
    if(player === data.player2) {
        let bestScore = -10000;
        for(let i = 0; i < potentalMoves.length; i++) {
            if(potentalMoves[i].score > bestScore) {
                bestScore = potentalMoves[i].score;
                bestMove = i;
            }
        }
    }else if(player === data.player1) {
        let bestScore = 10000;
        for(let i = 0; i < potentalMoves.length; i++) {
            if(potentalMoves[i].score < bestScore) {
                bestScore = potentalMoves[i].score;
                bestMove = i;
            }
        }
    }
    data.gameOver = false;
    return potentalMoves[bestMove];
}