
const player1 = {name: "Игрок 1", chips: 100, hand: [], folded: false};
const player2 = {name: "Игрок 2", chips: 100, hand: [], folded: false};
let currentPlayer = player1;
let otherPlayer = player2;
let pot = 0;
let deck = [];
let lastBet = 0;
let turnTimer, timeLeft = 30;

function initGame() {
    player1.chips = 100;
    player2.chips = 100;
    player1.folded = false;
    player2.folded = false;
    document.getElementById('player1-name').value = player1.name;
    document.getElementById('player2-name').value = player2.name;
    updateUI();
    newRound();
}

function newRound() {
    player1.hand = [];
    player2.hand = [];
    player1.folded = false;
    player2.folded = false;
    pot = 0;
    lastBet = 0;
    currentPlayer = player1;
    otherPlayer = player2;
    shuffleDeck();
    dealCards();
    updateUI();
    startTurnTimer();
}

function shuffleDeck() {
    deck = [];
    const suits = ["♠","♥","♦","♣"];
    const values = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
    suits.forEach(s => values.forEach(v => deck.push(v + s)));
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards() {
    for (let i = 0; i < 2; i++) {
        player1.hand.push(deck.pop());
        player2.hand.push(deck.pop());
    }
}

function checkAction() {
    swapPlayers();
    updateUI();
    resetTimer();
}
function callAction() {
    const needed = lastBet;
    if (needed > otherPlayer.chips) {
        allInAction();
        return;
    }
    otherPlayer.chips -= needed;
    pot += needed;
    swapPlayers();
    updateUI();
    resetTimer();
}
function raiseAction() {
    const raise = parseInt(prompt("Введите сумму для рейза:"));
    if (isNaN(raise) || raise <= lastBet) {
        alert("Неправильная сумма.");
        return;
    }
    if (raise > otherPlayer.chips) {
        alert("Недостаточно фишек.");
        return;
    }
    pot += (raise - lastBet);
    lastBet = raise;
    otherPlayer.chips -= raise;
    swapPlayers();
    updateUI();
    resetTimer();
}
function allInAction() {
    pot += otherPlayer.chips;
    lastBet += otherPlayer.chips;
    otherPlayer.chips = 0;
    swapPlayers();
    updateUI();
    resetTimer();
}
function foldAction() {
    currentPlayer.folded = true;
    determineWinner();
}

function swapPlayers() {
    [currentPlayer, otherPlayer] = [otherPlayer, currentPlayer];
}

function determineWinner() {
    stopTimer();
    let winner = null;
    if (player1.folded) winner = player2;
    else if (player2.folded) winner = player1;
    else {
        const rank = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14};
        const max1 = Math.max(...player1.hand.map(c => rank[c.slice(0, -1)]));
        const max2 = Math.max(...player2.hand.map(c => rank[c.slice(0, -1)]));
        if (max1 > max2) winner = player1;
        else if (max2 > max1) winner = player2;
    }
    if (winner) {
        winner.chips += pot;
        document.getElementById("result").innerText = winner.name + " выигрывает!";
        document.getElementById(winner === player1 ? "player1-area" : "player2-area").classList.add("win");
        setTimeout(() => {
            document.getElementById(winner === player1 ? "player1-area" : "player2-area").classList.remove("win");
        }, 2000);
    } else {
        player1.chips += pot/2;
        player2.chips += pot/2;
        document.getElementById("result").innerText = "Ничья!";
    }
    updateUI();
}

function updateUI() {
    document.getElementById("turn").innerText = "Ход: " + currentPlayer.name;
    document.getElementById("pot-amount").innerText = pot;
    document.getElementById("timer").innerText = timeLeft;
    document.getElementById("bet-amount").innerText = lastBet;
    function updatePlayerUI(player, id) {
        const playerDiv = document.getElementById(id);
        const nameInput = playerDiv.querySelector("input");
        nameInput.value = player.name;
        playerDiv.querySelector(".chips").innerText = "Фишки: " + player.chips;
        const handDiv = playerDiv.querySelector(".hand");
        handDiv.innerHTML = "";
        player.hand.forEach(card => {
            const cardEl = document.createElement("div");
            cardEl.className = "card";
            cardEl.innerText = card;
            handDiv.appendChild(cardEl);
        });
    }
    updatePlayerUI(player1, "player1-area");
    updatePlayerUI(player2, "player2-area");
}

function startTurnTimer() {
    stopTimer();
    timeLeft = 30;
    document.getElementById("timer").innerText = timeLeft;
    turnTimer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(turnTimer);
            checkAction();
        }
    }, 1000);
}
function stopTimer() {
    clearInterval(turnTimer);
}
function resetTimer() {
    stopTimer();
    startTurnTimer();
}

document.getElementById("player1-name").addEventListener("change", function() {
    player1.name = this.value;
    updateUI();
});
document.getElementById("player2-name").addEventListener("change", function() {
    player2.name = this.value;
    updateUI();
});
document.getElementById("check-btn").addEventListener("click", checkAction);
document.getElementById("call-btn").addEventListener("click", callAction);
document.getElementById("raise-btn").addEventListener("click", raiseAction);
document.getElementById("allin-btn").addEventListener("click", allInAction);
document.getElementById("fold-btn").addEventListener("click", foldAction);
document.getElementById("newgame-btn").addEventListener("click", newRound);

window.onload = initGame;
