/*----- constants -----*/
const chessBoard = document.querySelector("#chessboard");
const playerDisplay = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const width = 8;
const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook,
]

/*----- state variables -----*/
//start state
let playerGo = 'black';
playerDisplay.textContent = 'black';

function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = startPiece;
        //make it drag and drop
        if(square.firstChild)
            square.firstChild.setAttribute('draggable',true);
        square.setAttribute('square-id', i);
        //setting the colors of the board
        //i is the column number
        let sqcolor = getSquareColor(i);
        square.classList.add(sqcolor);

        //setting the colors of the pieces
        if( i <= 15)
        {
            square.firstChild.firstChild.classList.add('black');
        }

        //last 16
        if( i >= 48 )
        {
            square.firstChild.firstChild.classList.add('white');
        }

        chessBoard.append(square);
    })

}

//function to get color of the square based on index (column)
function getSquareColor(index) {
    const row = Math.floor((63 - index) / 8) + 1;
    return (row % 2 === 0) ? ((index % 2 === 0) ? "beige" : "brown") : ((index % 2 === 0) ? "brown" : "beige");
}

createBoard();
/*----- cached elements  -----*/
const squares = document.querySelectorAll(".square");

/*----- event listeners -----*/
squares.forEach(square => {
    square.addEventListener('dragstart', dragStart);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', dragDrop);
})

//drag and drop functions
let startPositionId;
let draggedElement;

function dragStart(e) {
    startPositionId = e.target.parentNode.getAttribute('square-id');
    draggedElement = e.target
}

function dragOver(e) {
    //to prevent the default action from happening, don't need to know what happens
    e.preventDefault();
}

function dragDrop(e) {
    //we drop into empty squares most of the time; 
    //but when not empty, we need to make sure we are dropping into the square itself and not on an svg 
    e.stopPropagation(); //didn't work without this
    console.log('playerGo',playerGo);
    console.log('e.target', e.target);
    //if we are dragging a piece, we want to make sure that the dragged element is of the right colour (playerGo's color)
    const isCorrectPlayer = draggedElement.firstChild.classList.contains(playerGo);
    const taken = e.target.classList.contains('piece');
    const opponent = playerGo === 'white' ? 'black' : 'white'
    //check if the target contains an opponent piece
    const takenByOpponent = e.target.firstChild?.classList.contains(opponent);

    if(isCorrectPlayer) {
        //if it is taken by the opponent and the move is valid
        if(takenByOpponent && isValid(e.target)) {
            e.target.parentNode.append(draggedElement);
            e.target.remove();
            checkForVictory();
            changePlayer();
            return;
        }

        //invalid move
        if(taken && !takenByOpponent)
        {
            infoDisplay.textContent = "Invalid move!"
            setTimeout(() => infoDisplay.textContent = "", 3000);
            return;
        }
        //assuming nothing is in the square
        if(isValid(e.target)) {
            e.target.append(draggedElement);
            checkForVictory();
            changePlayer();
            return;
        }
    }
}
//end of drag and drop functions

/*----- functions -----*/


function isValid(target)
{  
    return true;
}

//Check for winner and helper functions
function checkForVictory() {
    const kings = Array.from(document.querySelectorAll('#king'));
    const whiteKingExists = kings.some(king => king.firstChild.classList.contains('white'));
    const blackKingExists = kings.some(king => king.firstChild.classList.contains('black'));

    if (!whiteKingExists) {
        declareWinner("Black");
    }

    if (!blackKingExists) {
        declareWinner("White");
    }
}

function declareWinner(winner) {
    infoDisplay.innerHTML = `${winner} Player Wins!`;
    disableDraggable();
}

function disableDraggable() {
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach(square => {
        if (square.firstChild) {
            square.firstChild.setAttribute('draggable', false);
        }
    });
}

//end of check for winner and helper functions

