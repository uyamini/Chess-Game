/*----- constants -----*/
const gameBoard = document.querySelector("#gameboard");
const playerDisplay = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const width = 8;

/*----- state variables -----*/
//start state
let playerGo = 'black';
playerDisplay.textContent = 'black';

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

/*----- cached elements  -----*/


/*----- event listeners -----*/


/*----- functions -----*/

function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = startPiece;
        //make it drag and drop
        if(square.firstChild)
            square.firstChild.setAttribute('draggable',true);
        
        square.setAttribute('square-id', i);
        //square.classList.add('beige');
        //setting the colors of the board
        //finds the row number, i is the column number (got this formula from the internet)
        const row = Math.floor((63-i)/8) + 1;
        if(row % 2 === 0)
        {
            square.classList.add( i % 2 === 0 ?"beige" : "brown")
        }
        else{
            square.classList.add( i % 2 === 0 ?"brown" : "beige")
        }

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

        gameBoard.append(square);
    })

}

createBoard();
