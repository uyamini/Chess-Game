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
                // Assign unique ID based on color
                const color = (i < 16) ? 'black' : 'white'; // Assuming first 16 pieces are black
                square.firstChild.setAttribute('id', 'king.' + color);
            }
    
            // Make it draggable if there's a piece
            if (square.firstChild)
                square.firstChild.setAttribute('draggable', true);
    
            square.setAttribute('square-id', i);
    
            // Setting the colors of the board
            let sqcolor = getSquareColor(i);
            square.classList.add(sqcolor);
    
            // Setting the colors of the pieces
            if (i <= 15) {
                square.firstChild.firstChild.classList.add('black');
            }
    
            if (i >= 48) {
                square.firstChild.firstChild.classList.add('white');
            }
    
            chessBoard.append(square);
        });
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
                    startId - width * 2 === targetId && startId >= 48 || //two rows above if we're in the starting row of the pawn
                startId - width === targetId || //row above
                startId - width + 1 === targetId && target.classList.contains('piece') || //caputuring to the right
                startId - width - 1 === targetId && target.classList.contains('piece')  //capturing to the left
            ) {
                return true;
            } else {
                return false;
            }
            break;

        case 'rook':
            const startRow = Math.floor((63 - startId) / 8) + 1;
            const targetRow = Math.floor((63 - targetId) / 8) + 1;
            const startCol = startId % 8;
            const targetCol = targetId % 8;

            //if moving to the same row or column
            if (startRow === targetRow || startCol === targetCol) {
                //if there is something in the way
                if (startRow === targetRow) {
                    //moving left
                    if (targetId < startId) {
                        for (let i = startId - 1; i > targetId; i--) {
                            if (squares[i].classList.contains('piece')) {
                                return false;
                            }
                        }
                    }
                    //moving right
                    if (targetId > startId) {
                        for (let i = startId + 1; i < targetId; i++) {
                            if (squares[i].classList.contains('piece')) {
                                return false;
                            }
                        }
                    }
                } else {
                    //moving up
                    if (targetId < startId) {
                        for (let i = startId - width; i > targetId; i -= width) {
                            if (squares[i].classList.contains('piece')) {
                                return false;
                            }
                        }
                    }
                    //moving down
                    if (targetId > startId) {
                        for (let i = startId + width; i < targetId; i += width) {
                            if (squares[i].classList.contains('piece')) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
            return false;

        case 'knight':
            //getting the squares in which the knight can move to
            const validMoves = getKnightMoves(startId);
            return validMoves.includes(targetId);

        case 'bishop':
            const startColor = getSquareColor(startId);
            const targetColor = getSquareColor(targetId);
            //if moving diagonally, the colors of the start and end need to be the same
            if(startColor === targetColor) {
                const difference = Math.abs(startId - targetId);
                //if moving diagonally, the difference in column and row numbers will be the same
                if (difference % 7 === 0 || difference % 9 === 0) {
                    //if moving up to the right or down to the left
                    if (startId > targetId) {
                        for (let i = startId - width - 1; i > targetId; i -= width + 1) {
                            if (squares[i].classList.contains('piece')) {
                                return false;
                            }
                        }
                    }
                    //if moving up to the left or down to the right
                    if (startId < targetId) {
                        for (let i = startId + width + 1; i < targetId; i += width + 1) {
                            if (squares[i].classList.contains('piece')) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            }
            return false;

        case 'queen':
            //queens can move like both bishops and rooks
            return isValid(document.querySelector(`.square[square-id='${targetId}']`));
            
        case 'king':
            //kings can move only one square in any direction
            const validKingMoves = getKingMoves(startId);
            return validKingMoves.includes(targetId);
    }
}

function getKnightMoves(startId) {
    const row = Math.floor((63 - startId) / 8) + 1;
    const col = startId % 8;
    const possibleMoves = [];
    //direction vectors for knight moves
    const directions = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]];

    for (let dir of directions) {
        const newRow = row + dir[0];
        const newCol = col + dir[1];
        if (newRow >= 1 && newRow <= 8 && newCol >= 0 && newCol <= 7) {
            possibleMoves.push((63 - (newRow - 1) * 8) - newCol);
        }
    }
    return possibleMoves;
}

function getKingMoves(startId) {
    const row = Math.floor((63 - startId) / 8) + 1;
    const col = startId % 8;
    const possibleMoves = [];
    //direction vectors for king moves
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];

    for (let dir of directions) {
        const newRow = row + dir[0];
        const newCol = col + dir[1];
        if (newRow >= 1 && newRow <= 8 && newCol >= 0 && newCol <= 7) {
            possibleMoves.push((63 - (newRow - 1) * 8) - newCol);
        }
    }
    return possibleMoves;
}

function changePlayer() {
    playerGo = playerGo === 'white' ? 'black' : 'white';
    playerDisplay.textContent = playerGo;
}

function checkForVictory() {
    const whiteKing = document.querySelector('.piece#king.white');
    const blackKing = document.querySelector('.piece#king.black');

    if (!whiteKing) {
        infoDisplay.textContent = "Black wins!";
        removeEventListeners();
    }
    if (!blackKing) {
        infoDisplay.textContent = "White wins!";
        removeEventListeners();
    }
}


function removeEventListeners() {
    squares.forEach(square => {
        square.removeEventListener('dragstart', dragStart);
        square.removeEventListener('dragover', dragOver);
        square.removeEventListener('drop', dragDrop);
    });
}



function getValidMoves(startId) {
    const piece = document.querySelector(`.square[square-id='${startId}'] .piece`);
    const square = document.querySelector(`.square[square-id='${startId}']`);
    const moves = [];

    switch (piece.id) {
        case 'pawn':
            // Implement logic for pawn moves
            const direction = piece.classList.contains('white') ? 1 : -1;
            const nextSquare = document.querySelector(`.square[square-id='${parseInt(startId) + 8 * direction}']`);
            const nextNextSquare = document.querySelector(`.square[square-id='${parseInt(startId) + 16 * direction}']`);
            if (nextSquare && !nextSquare.hasChildNodes()) {
                moves.push(parseInt(startId) + 8 * direction);
                if ((startId[1] === '2' && direction === 1) || (startId[1] === '7' && direction === -1)) {
                    if (nextNextSquare && !nextNextSquare.hasChildNodes()) {
                        moves.push(parseInt(startId) + 16 * direction);
                    }
                }
            }
            // Implement logic for pawn captures
            const captureSquares = [
                document.querySelector(`.square[square-id='${parseInt(startId) + 8 * direction + 1}']`),
                document.querySelector(`.square[square-id='${parseInt(startId) + 8 * direction - 1}']`)
            ];
            captureSquares.forEach(square => {
                if (square && square.hasChildNodes() && square.firstChild.classList.contains(playerGo === 'white' ? 'black' : 'white')) {
                    moves.push(parseInt(square.getAttribute('square-id')));
                }
            });
            break;
        case 'rook':
            // Implement logic for rook moves
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            directions.forEach(direction => {
                for (let i = 1; i <= 7; i++) {
                    const nextSquare = document.querySelector(`.square[square-id='${parseInt(startId) + 8 * direction[0] + direction[1]}']`);
                    if (nextSquare) {
                        if (!nextSquare.hasChildNodes()) {
                            moves.push(parseInt(nextSquare.getAttribute('square-id')));
                        } else {
                            if (nextSquare.firstChild.classList.contains(playerGo === 'white' ? 'black' : 'white')) {
                                moves.push(parseInt(nextSquare.getAttribute('square-id')));
                            }
                            break;
                        }
                    } else {
                        break;
                    }
                }
            });
            break;
        case 'knight':
            // Implement logic for knight moves
            const knightMoves = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            knightMoves.forEach(move => {
                const nextSquare = document.querySelector(`.square[square-id='${parseInt(startId) + 8 * move[0] + move[1]}']`);
                if (nextSquare && (!nextSquare.hasChildNodes() || nextSquare.firstChild.classList.contains(playerGo === 'white' ? 'black' : 'white'))) {
                    moves.push(parseInt(nextSquare.getAttribute('square-id')));
                }
            });
            break;
        case 'bishop':
            // Implement logic for bishop moves
            const bishopDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
            bishopDirections.forEach(direction => {
                for (let i = 1; i <= 7; i++) {
                    const nextSquare = document.querySelector(`.square[square-id='${parseInt(startId) + 8 * direction[0] + direction[1]}']`);
                    if (nextSquare) {
                        if (!nextSquare.hasChildNodes()) {
                            moves.push(parseInt(nextSquare.getAttribute('square-id')));
                        } else {
                            if (nextSquare.firstChild.classList.contains(playerGo === 'white' ? 'black' : 'white')) {
                                moves.push(parseInt(nextSquare.getAttribute('square-id')));
                            }
                            break;
                        }
                    } else {
                        break;
                    }
                }
            });
            break;
        case 'queen':
            // Implement logic for queen moves
            const queenDirections = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
            queenDirections.forEach(direction => {
                for (let i = 1; i <= 7; i++) {
                    const nextSquare = document.querySelector(`.square[square-id='${parseInt(startId) + 8 * direction[0] + direction[1]}']`);
                    if (nextSquare) {
                        if (!nextSquare.hasChildNodes()) {
                            moves.push(parseInt(nextSquare.getAttribute('square-id')));
                        } else {
                            if (nextSquare.firstChild.classList.contains(playerGo === 'white' ? 'black' : 'white')) {
                                moves.push(parseInt(nextSquare.getAttribute('square-id')));
                            }
                            break;
                        }
                    } else {
                        break;
                    }
                }
            });
            break;
        case 'king':
            // Implement logic for king moves
            const kingMoves = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
            kingMoves.forEach(move => {
                const nextSquare = document.querySelector(`.square[square-id='${parseInt(startId) + 8 * move[0] + move[1]}']`);
                if (nextSquare && (!nextSquare.hasChildNodes() || nextSquare.firstChild.classList.contains(playerGo === 'white' ? 'black' : 'white'))) {
                    moves.push(parseInt(nextSquare.getAttribute('square-id')));
                }
            });
            break;
        default:
            return [];
    }

    return moves;
}

function checkForCheckmate() {
    // Identify the current player's color
    var currentPlayerColor = (playerGo === "black") ? "black" : "white";
    
    // Find the current player's king element
    var kingElement = document.getElementById("king." + currentPlayerColor);

    // Check if the king element exists
    if (!kingElement) {
        console.error("Current player's king not found!");
        return;
    }

    // Check for checkmate logic here...
    // You can use the kingElement to determine the king's position on the board
    // and then check if it is under attack or if it has any legal moves
    
    // Example: Checking if the king is in check
    var isKingInCheck = isSquareUnderAttack(kingElement);

    if (isKingInCheck) {
        console.log("King is in check!");
        // Additional logic for handling checkmate...
    } else {
        console.log("King is not in check.");
        // Additional logic if king is not in check...
    }
}
