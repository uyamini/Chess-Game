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
                    startId - width - 2 === targetId ||
                    startId - width + 2 === targetId 
                ) {
                    return true;
                }
                break;

                case 'bishop':
                const directions = [-1, 1];
                const validMoves = [];

                for (let xAxis of directions) {
                    for (let yAxis of directions) {
                        for (let i = 1; i <= 7; i++) {
                            const target = startId + (xAxis * width + yAxis) * i;
                            const targetSquare = document.querySelector(`[square-id="${target}"]`);
                            const interveningSquare = document.querySelector(`[square-id="${startId + (xAxis * width + yAxis) * (i - 1)}"]`);

                            if (target === targetId && (!targetSquare.firstChild || i === 1)) {
                                validMoves.push(true);
                                break;
                            } else if (target !== targetId && targetSquare && interveningSquare && interveningSquare.firstChild) {
                                break;
                            }
                        }
                    }
                }

                if (validMoves.includes(true)) {
                    return true;
                }
                break;


                case 'rook':
                    const rHorizontalDirections = [-1, 1];
                    const rVerticalDirections = [-width, width];
                    const rValidMoves = [];
                
                    //Horizontal movement
                    for (let hDirection of rHorizontalDirections) {
                        for (let i = 1; i <= 7; i++) {
                            const target = startId + hDirection * i;
                            const targetSquare = document.querySelector(`[square-id="${target}"]`);
                            const interveningSquares = [];
                
                            for (let j = 1; j < i; j++) {
                                interveningSquares.push(document.querySelector(`[square-id="${startId + hDirection * j}"]`));
                            }
                
                            if (target === targetId && (!targetSquare.firstChild || i === 1)) {
                                if (interveningSquares.every(square => !square.firstChild)) {
                                    rValidMoves.push(true);
                                }
                                break;
                            } else if (target !== targetId && targetSquare && interveningSquares.some(square => square && square.firstChild)) {
                                break;
                            }
                        }
                    }
                
                    //Vertical movement
                    for (let vDirection of rVerticalDirections) {
                        for (let i = 1; i <= 7; i++) {
                            const target = startId + vDirection * i;
                            const targetSquare = document.querySelector(`[square-id="${target}"]`);
                            const interveningSquares = [];
                
                            for (let j = 1; j < i; j++) {
                                interveningSquares.push(document.querySelector(`[square-id="${startId + vDirection * j}"]`));
                            }
                
                            if (target === targetId && (!targetSquare.firstChild || i === 1)) {
                                if (interveningSquares.every(square => !square.firstChild)) {
                                    rValidMoves.push(true);
                                }
                                break;
                            } else if (target !== targetId && targetSquare && interveningSquares.some(square => square && square.firstChild)) {
                                break;
                            }
                        }
                    }
                
                    if (rValidMoves.includes(true)) {
                        return true;
                    }
                    break;

                    
                    case 'queen':
        // Combining the logic for rook and bishop
        // Rook logic
        const rookValidMoves = [];
        const rookDirections = [-1, 1, -width, width];
        for (let direction of rookDirections) {
            for (let i = 1; i <= 7; i++) {
                const target = startId + direction * i;
                const targetSquare = document.querySelector(`[square-id="${target}"]`);
                const interveningSquares = [];
                for (let j = 1; j < i; j++) {
                    interveningSquares.push(document.querySelector(`[square-id="${startId + direction * j}"]`));
                }
                if (target === targetId && (!targetSquare.firstChild || i === 1)) {
                    if (interveningSquares.every(square => !square.firstChild)) {
                        rookValidMoves.push(true);
                    }
                    break;
                } else if (target !== targetId && targetSquare && interveningSquares.some(square => square && square.firstChild)) {
                    break;
                }
            }
        }

        //Bishop logic
        const bishopValidMoves = [];
        const bishopDirections = [-width - 1, -width + 1, width - 1, width + 1];
        for (let direction of bishopDirections) {
            for (let i = 1; i <= 7; i++) {
                const target = startId + direction * i;
                const targetSquare = document.querySelector(`[square-id="${target}"]`);
                const interveningSquares = [];
                for (let j = 1; j < i; j++) {
                    interveningSquares.push(document.querySelector(`[square-id="${startId + direction * j}"]`));
                }
                if (target === targetId && (!targetSquare.firstChild || i === 1)) {
                        if (interveningSquares.every(square => !square.firstChild)) {
                        bishopValidMoves.push(true);
                    }
                    break;
                } else if (target !== targetId && targetSquare && interveningSquares.some(square => square && square.firstChild)) {
                    break;
                }
            }
        }

        //Combining rook and bishop valid moves
        if (rookValidMoves.includes(true) || bishopValidMoves.includes(true)) {
            return true;
        }
        break;

                case 'king' :
                    if (
                        startId + 1 === targetId ||
                        startId - 1 === targetId ||
                        startId + width === targetId ||
                        startId - width === targetId ||
                        startId + width +1 === targetId ||
                        startId + width -1 === targetId ||
                        startId - width +1 === targetId ||
                        startId - width -1 === targetId 
                    ) {
                        return true;
                    }
                    break;
            }
                
    }

    function changePlayer()
    {
        if(playerGo == "black") {
            reverseIds();
            playerGo = "white";
            playerDisplay.textContent = 'white';
        }
        else {
            revertIds();
            playerGo = "black";
            playerDisplay.textContent = "black";
        }
    }

    //essentially like flipping the chess board
    function reverseIds() {
        // const allSquares = document.querySelectorAll(".square");
        squares.forEach((square, i) => 
        square.setAttribute('square-id', (width*width -1) - i));
    }
    
    function revertIds() {
    //   const allSquares = document.querySelectorAll(".square");
        squares.forEach((square, i) => 
        square.setAttribute('square-id', i));
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
    // Check for check
    function checkForCheck() {
        const kings = Array.from(document.querySelectorAll('#king'));
        const currentPlayer = playerGo === 'white' ? 'black' : 'white';
        const opponent = playerGo === 'white' ? 'black' : 'white';
        const currentPlayerKing = kings.find(king => king.firstChild.classList.contains(currentPlayer));
        const opponentPieces = Array.from(document.querySelectorAll(`.${opponent}`));

        const isCheck = opponentPieces.some(piece => isValid(piece.parentNode, currentPlayerKing.parentNode));

        if (isCheck) {
            infoDisplay.textContent = `${currentPlayer} is in check!`;
        }
    }

    function checkForCheckmate(e) {
        opponentKing = document.querySelector(`#${playerGo === 'white' ? 'black' : 'white'}-king`);
        if (!opponentKing) {
          return;
        }
              const opponentKingSquare = opponentKing.parentNode;
              const opponentColor = playerGo === 'white' ? 'black' : 'white';
          
              if (isInCheck(opponentKingSquare, opponentColor)) {
                  const legalMoves = generateLegalMovesForOpponent(opponentColor);
          
                  const isCheckmate = legalMoves.every(move => {
                      const targetSquare = move.target;
                      const capturedPiece = targetSquare.firstChild; // Store captured piece (if any)
                      const tempKingSquare = opponentKing.parentNode;
          
                      move.target.appendChild(opponentKing);  // Simulate move
                      opponentKingSquare.removeChild(opponentKing);
          
                      if (capturedPiece) {
                          capturedPiece.parentNode.removeChild(capturedPiece); // Remove captured piece
                      }
          
                      const kingInCheck = isInCheck(move.target, opponentColor); // Check for check after move
          
                      tempKingSquare.appendChild(opponentKing);   // Revert move
                      opponentKingSquare.removeChild(opponentKing);
                      if (capturedPiece) {
                          move.target.appendChild(capturedPiece);
                      }
          
                      return kingInCheck;
                  });
          
                  if (isCheckmate) {
                      infoDisplay.innerHTML = `Checkmate! ${playerGo} Player Wins!`;
                      disableDraggable();
                  }
              }
          }
          
          function isInCheck(kingSquare, kingColor) {
              const opponentColor = kingColor === 'white' ? 'black' : 'white';
              const opponentPieces = Array.from(document.querySelectorAll(`.${opponentColor}`));
          
              for (const piece of opponentPieces) {
                  if (isValid(piece.parentNode) && piece.parentNode !== kingSquare) {
                      const validMove = isValid(piece.parentNode);
                      if (validMove) {
                          return true;
                      }
                  }
              }
          
              return false;
          }
          
          function generateLegalMovesForOpponent(opponentColor) {
              const opponentPieces = Array.from(document.querySelectorAll(`.${opponentColor}`));
              const legalMoves = [];
            
              opponentPieces.forEach(piece => {
                const pieceSquare = piece.parentNode;
                const pieceId = piece.id;
            
                for (const square of squares) {
                  if (isValid(square) && pieceSquare !== square) {
                    const targetSquare = square;
                    const capturedPiece = targetSquare.firstChild; // Store captured piece (if any)
            
                    // Simulate move (without actually removing the king)
                    const tempKingSquare = opponentKing.parentNode;
                    move.target.appendChild(opponentKing);  // (Simulate move - not needed here)
                    opponentKingSquare.removeChild(opponentKing);
            
                    if (capturedPiece) {
                      // Check if captured piece is the opponent's king
                      if (capturedPiece.id === `${opponentColor}-king`) {
                        continue; // Skip this move as it captures the king
                      }
                      capturedPiece.parentNode.removeChild(capturedPiece); // Remove captured piece
                    }
            
                    const validMove = isValid(targetSquare); // Recalculate validity considering captured piece
            
                    // Revert simulated move (not needed here)
                    tempKingSquare.appendChild(opponentKing);
                    opponentKingSquare.removeChild(opponentKing);
                    if (capturedPiece) {
                      move.target.appendChild(capturedPiece);
                    }
            
                    if (validMove) {
                      legalMoves.push({ piece: piece, target: square });
                    }
                  }
                }
              });
            
              return legalMoves;
            }
      