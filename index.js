(function () {
  let board = ["", "", "", "", "", "", "", "", ""];
  let nextPlayer;
  let player;
  let cpu;

  document.querySelector("#x").addEventListener("click", init.bind(null, "x"));
  document.querySelector("#o").addEventListener("click", init.bind(null, "o"));

  function init(playerSymbol) {
    resetBoard();
    player = playerSymbol;
    cpu = getOtherPlayer(playerSymbol);
    nextPlayer = "x";
    render(board);

    document.querySelector("#playerSelection").style.display = "none";
    document.querySelector("#gameBoard").addEventListener("click", playerPlay);

    if (nextPlayer === cpu) {
      computerPlay();
    }
  }

  function playerPlay(e) {
    const target = e.target;
    if (target.className === "cell" && nextPlayer !== cpu) {
      const targetId = parseInt(target.id.substring(4));
      if (board[targetId] === "") {
        board[targetId] = player;
        nextPlayer = cpu;
        render(board);
        if (getGameState(board) === "open") {
          computerPlay();
        }
      }
    }
  }

  function computerPlay() {
    const move = getOptimalRatedMove(board, cpu)[0];

    setTimeout(function () {
      board[move] = cpu;
      nextPlayer = player;
      render(board);
    }, 1000);
  }

  function availableMoves(board) {
    return board.map((_, index) => index).filter((index) => board[index] === "");
  }

  function getOtherPlayer(player) {
    return player === "x" ? "o" : "x";
  }

  function render(board) {
    document.querySelectorAll(".cell").forEach((cell, index) => (cell.textContent = board[index]));

    const gameState = getGameState(board);
    if (gameState === "tie") {
      document.querySelector("#display").textContent = "It's a tie!";
    }
    if (gameState === "x" || gameState === "o") {
      document.querySelector("#display").textContent = gameState.toUpperCase() + " has won!";
    }

    if (gameState === "x" || gameState === "o" || gameState === "tie") {
      document.querySelector("#gameBoard").removeEventListener("click", playerPlay);
      setTimeout(() => {
        document.querySelector("#display").textContent = "";
        document.querySelector("#playerSelection").style.display = "block";
      }, 1000);
    }

    if (gameState === "open") {
      switch (nextPlayer) {
        case player:
          document.querySelector("#display").textContent = "Your turn";
          break;
        case cpu:
          document.querySelector("#display").textContent = "Computer's turn";
          break;
        default:
          document.querySelector("#display").textContent = "";
      }
    }
  }

  function resetBoard() {
    board = ["", "", "", "", "", "", "", "", ""];
  }

  function rateMoves(board, nextPlayer) {
    return availableMoves(board).map((move) => [move, rateMove(board, nextPlayer, move)]);
  }

  function rateMove(board, nextPlayer, move) {
    const virtualBoard = simulateBoard(board, nextPlayer, move);
    const virtualState = getGameState(virtualBoard);
    const otherPlayer = getOtherPlayer(nextPlayer);
    if (virtualState === nextPlayer) {
      return 1;
    } else if (virtualState === otherPlayer) {
      return -1;
    } else if (virtualState === "tie") {
      return 0;
    } else {
      let bestPossibleOutcomeForOtherPlayer = getOptimalRatedMove(virtualBoard, otherPlayer)[1];
      return bestPossibleOutcomeForOtherPlayer * -1;
    }
  }

  function getOptimalRatedMove(board, player) {
    const ratedMoves = rateMoves(board, player);
    const bestPossibleRating = Math.max(...ratedMoves.map(([_, rating]) => rating));
    const optimalRatedMoves = ratedMoves.filter(([_, rating]) => rating === bestPossibleRating);
    return optimalRatedMoves[Math.floor(Math.random() * optimalRatedMoves.length)];
  }

  function simulateBoard(board, nextPlayer, move) {
    const newBoard = board.slice();
    newBoard[move] = nextPlayer;
    return newBoard;
  }

  function getGameState(board) {
    const lines = lineList(board);
    const lineResults = lines.map(evaluateLine);
    if (lineResults.includes("x")) return "x";
    if (lineResults.includes("o")) return "o";
    if (lineResults.includes("open")) return "open";
    return "tie";
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

    if (xCount === 3) return "x";
    if (oCount === 3) return "o";
    if (oCount > 0 && xCount > 0) return "blocked";
    return "open";
  }
})();
