(function () {
  let board = ["", "", "", "", "", "", "", "", ""];
  let nextPlayer;
  let playerSymbol;
  let cpuSymbol;

  render(board);

  document.querySelector("#x").addEventListener("click", function () {
    playerSymbol = "x";
    cpuSymbol = "o";
    nextPlayer = "x";
    init();
  });

  document.querySelector("#o").addEventListener("click", function () {
    playerSymbol = "o";
    cpuSymbol = "x";
    nextPlayer = "x";
    init();
    computerPlay();
  });

  function init() {
    resetBoard();
    render(board);
    document.querySelector("#playerSelection").style.display = "none";
    document.querySelector("#gameBoard").addEventListener("click", playerPlay);
    updateTurnIndicator();
  }

  // set up handler

  function playerPlay(e) {
    const target = e.target;
    let targetId;
    if (target.className !== "cell" || nextPlayer === cpuSymbol) {
      return;
    } else {
      targetId = parseInt(target.id.substring(4));
      if (board[targetId] === "") {
        board[targetId] = nextPlayer;
        nextPlayer = getInactivePlayer(nextPlayer);
        render(board);
        if (gameState(board) === "open") {
          updateTurnIndicator();
          computerPlay();
        }
      }
    }
  }

  function computerPlay() {
    const ratings = rateMoves(board, nextPlayer);

    // best possible Outcome
    let bestPossibleOutcome = -1;
    for (let i in ratings) {
      if (ratings[i][1] > bestPossibleOutcome) {
        bestPossibleOutcome = ratings[i][1];
      }
    }

    // array of 'optimal' moves
    const moves = [];
    for (let i in ratings) {
      if (ratings[i][1] === bestPossibleOutcome) {
        moves.push(ratings[i][0]);
      }
    }

    // select move;
    const rand = Math.floor(Math.random() * moves.length);
    const move = moves[rand];

    setTimeout(function () {
      board[move] = nextPlayer;
      nextPlayer = getInactivePlayer(nextPlayer);
      updateTurnIndicator();
      render(board);
    }, 1000);
  }

  function listMoves(board) {
    const moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        moves.push(i);
      }
    }
    return moves;
  }

  function getInactivePlayer(nextPlayer) {
    return nextPlayer === "x" ? "o" : "x";
  }

  // updates the DOM to reflect the state of board;
  function render(board) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(function (cell, index) {
      cell.textContent = board[index];
    });
    const res = gameState(board);
    if (res === "x" || res === "o" || res === "tie") {
      if (res === "tie") {
        document.querySelector("#result").textContent = "It's a tie!";
      } else {
        document.querySelector("#result").textContent =
          res.toUpperCase() + " has won!";
      }
      document.querySelector("#turnIndicator").textContent = "";
      document
        .querySelector("#gameBoard")
        .removeEventListener("click", playerPlay);
      setTimeout(function () {
        document.querySelector("#result").textContent = "";
        document.querySelector("#playerSelection").style.display = "block";
      }, 1000);
    }
  }

  function resetBoard() {
    board = ["", "", "", "", "", "", "", "", ""];
  }

  function rateMoves(board, nextPlayer) {
    return listMoves(board).map((move) => [
      move,
      rateMove(board, nextPlayer, move),
    ]);
  }

  function rateMove(board, nextPlayer, move) {
    const virtualBoard = simulateBoard(board, nextPlayer, move);
    const virtualState = gameState(virtualBoard);
    const otherPlayer = getInactivePlayer(nextPlayer);
    if (virtualState === nextPlayer) {
      return 1;
    } else if (virtualState === otherPlayer) {
      return -1;
    } else if (virtualState === "tie") {
      return 0;
    } else {
      /// virtualState === open - recursively evaluate minmax
      const possibleOutcomes = rateMoves(virtualBoard, otherPlayer);
      let bestOutcome = -2; // best outcome for the OTHER player;
      let outcome;
      for (let index in possibleOutcomes) {
        // assume OTHER player will play optimally
        outcome = possibleOutcomes[index][1];
        if (outcome > bestOutcome) {
          bestOutcome = outcome;
        }
      }
      return bestOutcome * -1; // flipping to outcome for CURRENT player;
    }
  }

  function simulateBoard(board, nextPlayer, move) {
    const newBoard = board.slice();
    newBoard[move] = nextPlayer;
    return newBoard;
  }

  function gameState(board) {
    const lines = lineList(board);

    let blocked = true;
    for (let line of lines) {
      const res = evaluateLine(line);
      if (res === "x") {
        return "x";
      } else if (res === "o") {
        return "o";
      } else if (res === "open") {
        blocked = false;
      }
    }

    return blocked ? "tie" : "open";
  }

  function lineList(board) {
    return [
      [board[0], board[1], board[2]], // rows
      [board[3], board[4], board[5]],
      [board[6], board[7], board[8]],
      [board[0], board[3], board[6]], // cols
      [board[1], board[4], board[7]],
      [board[2], board[5], board[8]],
      [board[0], board[4], board[8]], // diagonals
      [board[2], board[4], board[6]],
    ];
  }

  function evaluateLine(line) {
    const xCount = line.filter((cell) => cell === "x").length;
    const oCount = line.filter((cell) => cell === "o").length;

    if (xCount === 3) {
      return "x";
    } else if (oCount === 3) {
      return "o";
    } else if (oCount > 0 && xCount > 0) {
      return "blocked";
    } else {
      return "open";
    }
  }

  function updateTurnIndicator() {
    const res = gameState(board);
    if (res === "open") {
      const displayText =
        nextPlayer === playerSymbol ? "Your turn" : "Computer's turn";
      document.querySelector("#turnIndicator").textContent = displayText;
    } else {
      document.querySelector("#turnIndicator").textContent = "";
    }
  }
})();
