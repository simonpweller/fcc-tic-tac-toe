(function () {
  var board = ["", "", "", "", "", "", "", "", ""];
  var nextPlayer = "x";
  var playerSymbol = "x";
  var cpuSymbol = "o";

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
    var target = e.target;
    var targetId;
    if (target.className !== "cell" || nextPlayer === cpuSymbol) {
      return;
    } else {
      targetId = parseInt(target.id.substring(4));
      if (board[targetId] === "") {
        board[targetId] = nextPlayer;
        togglePlayers();
        render(board);
        if (gameState(board) === "open") {
          updateTurnIndicator();
          computerPlay();
        }
      }
    }
  }

  function computerPlay() {
    var ratings = rateMoves(board, nextPlayer);

    // best possible Outcome
    var bestPossibleOutcome = -1;
    for (i in ratings) {
      if (ratings[i][1] > bestPossibleOutcome) {
        bestPossibleOutcome = ratings[i][1];
      }
    }

    // array of 'optimal' moves
    var moves = [];
    for (i in ratings) {
      if (ratings[i][1] === bestPossibleOutcome) {
        moves.push(ratings[i][0]);
      }
    }

    // select move;
    var rand = Math.floor(Math.random() * moves.length);
    var move = moves[rand];

    setTimeout(function () {
      board[move] = nextPlayer;
      togglePlayers();
      updateTurnIndicator();
      render(board);
    }, 1000);
  }

  function listMoves(board) {
    var moves = [];
    for (var i = 0; i < board.length; i++) {
      if (board[i] === "") {
        moves.push(i);
      }
    }
    return moves;
  }

  // switch back and forth between players;
  function togglePlayers() {
    if (nextPlayer === "x") {
      nextPlayer = "o";
    } else {
      nextPlayer = "x";
    }
  }

  function getInactivePlayer(nextPlayer) {
    if (nextPlayer === "x") {
      return "o";
    } else {
      return "x";
    }
  }

  // updates the DOM to reflect the state of board;
  function render(board) {
    var cells = document.querySelectorAll(".cell");
    cells.forEach(function (cell, index) {
      cell.textContent = board[index];
    });
    var res = gameState(board);
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
    var moveList = listMoves(board);
    var ratedMoves = [];
    moveList.forEach(function (move) {
      ratedMoves.push([move, rateMove(board, nextPlayer, move)]);
    });
    return ratedMoves;
  }

  function rateMove(board, nextPlayer, move) {
    var virtualBoard = simulateBoard(board, nextPlayer, move);
    var virtualState = gameState(virtualBoard);
    var otherPlayer = getInactivePlayer(nextPlayer);
    if (virtualState === nextPlayer) {
      return 1;
    } else if (virtualState === otherPlayer) {
      return -1;
    } else if (virtualState === "tie") {
      return 0;
    } else {
      /// virtualState === open - recursively evaluate minmax
      var possibleOutcomes = rateMoves(virtualBoard, otherPlayer);
      var bestOutcome = -2; // best outcome for the OTHER player;
      var outcome;
      for (index in possibleOutcomes) {
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
    var newBoard = board.slice();
    newBoard[move] = nextPlayer;
    return newBoard;
  }

  function gameState(board) {
    var lines = lineList(board);

    // loop through lines;
    var line;
    var res;
    var blocked = true;
    for (var i = 0; i < lines.length; i++) {
      line = lines[i];
      res = evaluateLine.apply(null, line);
      if (res === "x") {
        return "x";
      } else if (res === "o") {
        return "o";
      } else if (res === "open") {
        blocked = false;
      }
    }

    if (blocked) {
      return "tie";
    }
    return "open";
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

  function evaluateLine(cell1, cell2, cell3) {
    var xCount = 0;
    var oCount = 0;

    for (var i = 0; i < 3; i++) {
      var cell = arguments[i];
      if (cell === "x") {
        xCount++;
      } else if (cell === "o") {
        oCount++;
      }
    }

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
    var res = gameState(board);
    if (res === "open") {
      if (nextPlayer === playerSymbol) {
        document.querySelector("#turnIndicator").textContent = "Your turn";
      } else if (nextPlayer === cpuSymbol) {
        document.querySelector("#turnIndicator").textContent =
          "Computer's turn";
      }
    } else {
      document.querySelector("#turnIndicator").textContent = "";
    }
  }
})();
