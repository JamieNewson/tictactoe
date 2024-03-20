const GameBoard = (function () {
  const totalCells = 9;
  const cells = [];

  const populateDisplay = () => {
    cells.length = 0;
    for (let i = 0; i < totalCells; i++) {
      cells.push(Cell());
    }
  };

  const selectSquare = (input) => {
    if (input.index > cells.length) return "oops!";

    const selection = cells[input.index];
    if (selection.getState() != 0) return;

    selection.setState(input.token);
  };

  const printDisplay = () => {
    const displayWithCellValues = [];
    for (let cell of cells) {
      displayWithCellValues.push(cell.getState());
    }
  };

  const getCells = () => cells;

  populateDisplay();

  events.on("resetBoard", populateDisplay);
  events.on("roundPlayed", selectSquare);
  events.on("roundPlayed", printDisplay);

  return { getCells };
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
  let isInPlay = true;
  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
    DOMController.updatePlayerDisplay(players.indexOf(activePlayer));
  };

  const getActivePlayer = () => activePlayer;

  const playRound = (index) => {
    if (!isInPlay) return;
    events.emit("roundPlayed", { index: index, token: activePlayer.token });
    roundsPlayed++;

    if (checkWinState()) displayEndScreen(activePlayer.name);
    else if (roundsPlayed >= 9) {
      displayEndScreen();
    }
    switchPlayerTurn();
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
      )
        return true;
    }
    return false;
  };

  const displayEndScreen = (winState) => {
    isInPlay = false;
    DOMController.updateResultDisplay(winState);
  };

  const resetGame = () => {
    roundsPlayed = 0;
    isInPlay = true;
  };

  const getIsInPlay = () => {
    return isInPlay;
  };

  const updatePlayerName = (name, index) => {
    players[index].name = name;
  };

  events.on("resetBoard", resetGame);

  return {
    getActivePlayer,
    playRound,
    updatePlayerName,
    getIsInPlay,
  };
})();

const DOMController = (function () {
  const cells = Array.from(document.querySelectorAll("li"));
  const playerDisplay = Array.from(document.querySelectorAll(".column"));
  const playerNames = Array.from(document.querySelectorAll(".name"));
  const resultDisplay = document.querySelector(".resultDisplay");
  const resultText = resultDisplay.firstChild;
  const resetBtn = document.querySelector(".reset");

  for (cell of cells) {
    cell.addEventListener("click", (event) => {
      let clickedCell = event.target;
      if (
        clickedCell.classList.contains("selected") ||
        !GameController.getIsInPlay()
      )
        return;
      clickedCell.classList.add("selected");
      GameController.playRound(cells.indexOf(clickedCell));
    });
    cell.addEventListener("mouseenter", (event) => {
      if (!GameController.getIsInPlay()) return;
      let hoveredCell = event.target;
      if (hoveredCell.textContent != "") return;
      hoveredCell.textContent = GameController.getActivePlayer().token;
    });
    cell.addEventListener("mouseout", (event) => {
      let hoveredCell = event.target;
      if (hoveredCell.classList.contains("selected")) return;
      hoveredCell.textContent = "";
    });
  }

  for (playerName of playerNames) {
    playerName.addEventListener("click", (event) => {
      var name = prompt("Please enter your name", "Name");
      if (name != null && name != "") {
        GameController.updatePlayerName(name, event.target.id);
        event.target.textContent = name;
      }
    });
  }

  resetBtn.addEventListener("click", () => {
    events.emit("resetBoard");
  });

  const updatePlayerDisplay = (activePlayer) => {
    if (activePlayer === 0) {
      playerDisplay[0].classList.add("selectedPlayer");
      playerDisplay[1].classList.remove("selectedPlayer");
    } else {
      playerDisplay[1].classList.add("selectedPlayer");
      playerDisplay[0].classList.remove("selectedPlayer");
    }
  };

  const updateResultDisplay = (winnerName) => {
    let textToDisplay = "";
    if (winnerName) textToDisplay = `${winnerName} has won!`;
    else textToDisplay = "It's a draw!";
    resultText.textContent = textToDisplay;
    resetBtn.style.display = "block";
  };

  const resetCellDisplay = () => {
    resetBtn.style.display = "none";
    resultText.textContent = "It's all to play for!";
    for (cell of cells) {
      cell.textContent = "";
      cell.classList.remove("selected");
    }
  };

  events.on("resetBoard", resetCellDisplay);

  return { updatePlayerDisplay, updateResultDisplay };
})();
