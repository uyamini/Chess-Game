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

/*----- functions -----*/


