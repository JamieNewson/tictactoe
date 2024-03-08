const GameBoard = (function () {
  const rows = 3;
  const columns = 3;
  const cells = [];

  const populateDisplay = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        cells.push(Cell());
      }
    }
  };

  const resetDisplay = () => {
    cells.length = 0;
    populateDisplay();
  };

  const selectSquare = (index, player) => {
    if (index > cells.length) return "oops!";

    const selection = cells[index];
    if (selection.getState() === 0) selection.setState(player);
  };

  const printDisplay = () => {
    const displayWithCellValues = [];
    for (let cell of cells) {
      displayWithCellValues.push(cell.getState());
    }
    console.log(displayWithCellValues);
  };

  const getCells = () => cells;

  populateDisplay();

  return { selectSquare, getCells, printDisplay, resetDisplay };
})();

function Cell() {
  let state = 0;

  const setState = (newState) => {
    state = newState;
  };

  const getState = () => state;

  return { getState, setState };
}

const GameController = (function () {
  const playerOneName = "Player 1";
  const playerTwoName = "Player 2";

  const players = [
    {
      name: playerOneName,
      token: "X",
    },
    {
      name: playerTwoName,
      token: "O",
    },
  ];

  let roundsPlayed = 0;
  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const playRound = (index) => {
    GameBoard.selectSquare(index, activePlayer.token);
    GameBoard.printDisplay();
    roundsPlayed++;
    if (checkWinState()) displayVictory();
    else {
      switchPlayerTurn();
    }
  };

  const checkWinState = () => {
    const cells = GameBoard.getCells();
    const combinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let comb of combinations) {
      if (
        cells[comb[0]].getState() == cells[comb[1]].getState() &&
        cells[comb[1]].getState() == cells[comb[2]].getState() &&
        cells[comb[0]].getState() != 0
      ) {
        return true;
      }
    }
    if (roundsPlayed >= 9) {
      displayDraw();
    }
    return false;
  };

  const displayVictory = () => {
    console.log(activePlayer.name + " won!");
    roundsPlayed = 0;
    GameBoard.resetDisplay();
  };

  const displayDraw = () => {
    console.log("It's a draw!");
    roundsPlayed = 0;
    GameBoard.resetDisplay();
  };

  return { getActivePlayer, playRound };
})();

const DOMController = function () {
  const cells = Array.from(document.querySelectorAll("li"));
  for (cell of cells) {
    cell.addEventListener("click", function (event) {
      event.target.textContent = GameController.getActivePlayer().token;
      GameController.playRound(cells.indexOf(event.target));
    });
  }
};
DOMController();
