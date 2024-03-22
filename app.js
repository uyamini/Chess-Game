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

        // Check if king element
        if (startPiece === 'king') {
            console.log("Found a king piece at index:", i);
        }
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
            checkForCheckmate(e);
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
            checkForCheckmate(e);
            changePlayer();
            return;
        }
    }
}
//end of drag and drop functions

/*----- functions -----*/


function isValid(target)
{  
    //parent's square-id if there is a pawn in the square
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement.id;

    switch(piece) {
        //got the math for this from the internet
        case 'pawn' :
            const starterRow = [8, 9, 10, 11, 12, 13, 14, 15];

            //to check if the move is valid
            if(
                starterRow.includes(startId) && startId + width * 2 === targetId ||
                startId + width === targetId || //row below
                startId + width - 1 === targetId && //diagonal
                document.querySelector(`[square-id="${startId + width -1}"]`).firstChild ||
                document.querySelector(`[square-id="${startId + width +1}"]`).firstChild
                ) {

                return true;
            }
            break;
        
        case 'knight' :
            if (
                //valid moves for knight
                startId + width * 2 - 1 === targetId ||
                startId + width * 2 + 1 === targetId ||
                startId + width - 2 === targetId ||
                startId + width + 2 === targetId ||
                startId - width * 2 - 1 === targetId ||
                startId - width * 2 + 1 === targetId ||
                startId - width + 2 === targetId ||
                startId - width - 2 === targetId
            ) {
                return true;
            }
            break;

        case 'bishop' :
            if (
                isDiagonal(startId, targetId)
            ) {
                return true;
            }
            break;

        case 'rook' :
            if (
                isStraight(startId, targetId)
            ) {
                return true;
            }
            break;

        case 'queen' :
            if (
                isStraight(startId, targetId) || 
                isDiagonal(startId, targetId)
            ) {
                return true;
            }
            break;

        case 'king' :
            if (
                isKingMove(startId, targetId)
            ) {
                return true;
            }
            break;
    }

    return false;
}

function isStraight(startId, targetId) {
    const diff = Math.abs(targetId - startId);
    //valid moves for rook
    return (
        (diff % width === 0 && targetId > startId && targetId <= startId + 7 * width) || // vertical down
        (diff % width === 0 && targetId < startId && targetId >= startId - 7 * width) || // vertical up
        (diff < width && targetId > startId) || // horizontal right
        (diff < width && targetId < startId) // horizontal left
    );
}

function isDiagonal(startId, targetId) {
    const diff = Math.abs(targetId - startId);
    //valid moves for bishop
    return (
        diff % (width - 1) === 0 && targetId > startId && targetId <= startId + 7 * (width - 1) || // diagonal down right
        diff % (width + 1) === 0 && targetId > startId && targetId <= startId + 7 * (width + 1) || // diagonal down left
        diff % (width - 1) === 0 && targetId < startId && targetId >= startId - 7 * (width - 1) || // diagonal up left
        diff % (width + 1) === 0 && targetId < startId && targetId >= startId - 7 * (width + 1) // diagonal up right
    );
}

function isKingMove(startId, targetId) {
    const diff = Math.abs(targetId - startId);
    return (
        diff === 1 || // horizontal move
        diff === width || // vertical move
        diff === width - 1 || // diagonal down right move
        diff === width + 1 || // diagonal down left move
        diff === width * 2 - 1 || // jump diagonal down right
        diff === width * 2 + 1 || // jump diagonal down left
        diff === width - 2 || // jump horizontal left
        diff === width + 2 // jump horizontal right
    );
}

function changePlayer() {
    playerGo = (playerGo === 'black') ? 'white' : 'black';
    playerDisplay.textContent = playerGo;
}

function checkForCheckmate(e) {
    // Checkmate logic here
    console.log("Checking for checkmate...");
}

function checkForVictory() {
    // Victory condition logic here
    console.log("Checking for victory...");
}

