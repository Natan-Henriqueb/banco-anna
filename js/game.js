"use strict";

/* =========================================================
   BANCO IMOBILIÁRIO
   GAME.JS
========================================================= */

const socket = window.io ? window.io() : null;

const diceFaces = {
    1: "⚀",
    2: "⚁",
    3: "⚂",
    4: "⚃",
    5: "⚄",
    6: "⚅"
};

let gameState = {
    playerId: localStorage.getItem("playerId") || null,
    playerName: localStorage.getItem("playerName") || "Natan",
    roomCode: localStorage.getItem("roomCode") || null,
    started: false,
    finished: false,
    phase: "roll",
    turnIndex: 0,
    turnNumber: 1,
    lastRoll: null,
    lastEvent: null,
    money: 1500,
    position: 0,
    players: [],
    properties: [],
    rolling: false
};

let previousPlayers = [];
let diceAnimation = null;
let diceAnimationStart = 0;
let pendingServerRoll = null;

const pieceTimers = new Map();

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    updatePlayerHUD();
    setupChat();
    setupActionButtons();
    updatePlayersCount();
    renderPlayers();

    const rollButton = document.getElementById("rollButton");

    if (rollButton) {
        rollButton.onclick = (event) => {
            event.preventDefault();
            rollDice();
        };
    }

    if (!socket) {
        showGameMessage("Servidor não conectado.");
        return;
    }

    socket.on("connect", () => {
        console.log("Socket conectado:", socket.id);
        reconnectRoom();
    });

    socket.on("game:start", (state) => {
        console.log("Partida iniciada:", state);

        if (!state) return;

        applyGameState(state, true);
    });

    socket.on("game:state", (state) => {
        console.log("Estado recebido:", state);

        if (!state) return;

        applyGameState(state, false);
    });

    socket.on("room:update", (room) => {
        console.log("Sala atualizada:", room);

        if (!room) return;

        if (room.state) {
            applyGameState(room.state, false);
            return;
        }

        if (Array.isArray(room.players)) {
            gameState.players = room.players;

            updatePlayersCount();
            updatePlayerHUD();
            updateTurnUI();
            renderPlayers();
            updateActionButtons();
        }
    });

    socket.on("room:reconnected", (data) => {
        console.log("Sala reconectada:", data);

        if (!data || !data.success) return;

        if (data.playerId) {
            gameState.playerId = data.playerId;

            localStorage.setItem(
                "playerId",
                data.playerId
            );
        }

        const code = data.roomCode || data.code;

        if (code) {
            gameState.roomCode = String(code)
                .trim()
                .toUpperCase();

            localStorage.setItem(
                "roomCode",
                gameState.roomCode
            );
        }

        if (data.room) {
            if (data.room.state) {
                applyGameState(
                    data.room.state,
                    false
                );
            } else if (
                Array.isArray(data.room.players)
            ) {
                gameState.players =
                    data.room.players;

                updatePlayerHUD();
                updatePlayersCount();
                updateTurnUI();
                renderPlayers();
                updateActionButtons();
            }
        }
    });

    socket.on("chat:message", (data) => {
        if (!data) return;

        addChatMessage(
            data.name || "Jogador",
            data.text || "",
            data.color || null
        );
    });

    socket.on("disconnect", () => {
        console.log("Socket desconectado.");
        showGameMessage("Conexão com o servidor perdida.");
    });

    updateActionButtons();
});

/* =========================================================
   RECONEXÃO DA SALA
========================================================= */

function reconnectRoom() {
    if (!socket) return;

    const savedRoomCode =
        localStorage.getItem("roomCode");

    const savedPlayerId =
        localStorage.getItem("playerId");

    const savedPlayerName =
        localStorage.getItem("playerName");

    if (!savedRoomCode) {
        gameState.playerId = socket.id;
        return;
    }

    gameState.roomCode = String(savedRoomCode)
        .trim()
        .toUpperCase();

    if (savedPlayerId) {
        gameState.playerId = savedPlayerId;
    }

    if (savedPlayerName) {
        gameState.playerName = savedPlayerName;
    }

    socket.emit(
        "room:reconnect",
        {
            roomCode: gameState.roomCode,
            playerId: gameState.playerId,
            playerName: gameState.playerName
        },
        (response) => {
            console.log(
                "Resposta da reconexão:",
                response
            );

            if (!response || !response.success) {
                console.warn(
                    "Não foi possível reconectar à sala."
                );
                return;
            }

            if (response.playerId) {
                gameState.playerId =
                    response.playerId;

                localStorage.setItem(
                    "playerId",
                    response.playerId
                );
            }

            if (response.roomCode) {
                gameState.roomCode =
                    String(response.roomCode)
                        .trim()
                        .toUpperCase();

                localStorage.setItem(
                    "roomCode",
                    gameState.roomCode
                );
            }

            if (response.room) {
                if (response.room.state) {
                    applyGameState(
                        response.room.state,
                        false
                    );
                } else if (
                    Array.isArray(
                        response.room.players
                    )
                ) {
                    gameState.players =
                        response.room.players;

                    updatePlayerHUD();
                    updatePlayersCount();
                    updateTurnUI();
                    renderPlayers();
                    updateActionButtons();
                }
            }
        }
    );
}

/* =========================================================
   APLICAR ESTADO DO SERVIDOR
========================================================= */

function applyGameState(state, isGameStart) {
    if (!state) return;

    previousPlayers = Array.isArray(gameState.players)
        ? gameState.players.map((player) => ({
            ...player
        }))
        : [];

    const receivedRoll = state.lastRoll;

    gameState = {
        ...gameState,
        ...state,
        players: Array.isArray(state.players)
            ? state.players
            : [],
        properties: Array.isArray(state.properties)
            ? state.properties
            : gameState.properties
    };

    /*
     * Se o servidor mandou o resultado enquanto
     * a animação ainda está acontecendo, guardamos.
     */

    if (receivedRoll && diceAnimation) {
        pendingServerRoll = receivedRoll;
    }

    const ownPlayer = findOwnPlayer();

    if (ownPlayer) {
        gameState.playerId = ownPlayer.id;
        gameState.playerName = ownPlayer.name;
        gameState.money = ownPlayer.money;
        gameState.position = ownPlayer.position;

        localStorage.setItem(
            "playerId",
            ownPlayer.id
        );

        localStorage.setItem(
            "playerName",
            ownPlayer.name
        );
    }

    updatePlayerHUD();
    updatePlayersCount();
    updateTurnUI();
    renderPlayers();
    renderPropertyOwnership();
    updateActionButtons();

    /*
     * NÃO atualizamos visualmente o dado enquanto
     * a animação estiver rodando.
     */

    if (!diceAnimation && receivedRoll) {
        updateDiceFromState();
    }

    if (isGameStart) {
        showGameMessage("A partida começou!");
    }
}

/* =========================================================
   JOGADOR ATUAL
========================================================= */

function findOwnPlayer() {
    if (!Array.isArray(gameState.players)) {
        return null;
    }

    let player = gameState.players.find(
        (p) => p.id === gameState.playerId
    );

    if (player) return player;

    if (socket) {
        player = gameState.players.find(
            (p) => p.id === socket.id
        );

        if (player) return player;
    }

    const savedId =
        localStorage.getItem("playerId");

    if (savedId) {
        player = gameState.players.find(
            (p) => p.id === savedId
        );

        if (player) return player;
    }

    const savedName =
        localStorage.getItem("playerName");

    if (savedName) {
        player = gameState.players.find(
            (p) => p.name === savedName
        );

        if (player) return player;
    }

    return null;
}

/* =========================================================
   HUD
========================================================= */

function updatePlayerHUD() {
    const player = findOwnPlayer();

    const name =
        player?.name ||
        gameState.playerName ||
        "Natan";

    const money =
        player?.money ??
        gameState.money ??
        1500;

    const properties =
        Array.isArray(player?.properties)
            ? player.properties.length
            : 0;

    const nameElement =
        document.getElementById("playerName");

    const initial =
        document.getElementById("playerInitial");

    const moneyElement =
        document.getElementById("playerMoney");

    const propertyCount =
        document.getElementById("propertyCount");

    if (nameElement) {
        nameElement.textContent = name;
    }

    if (initial) {
        initial.textContent =
            name.charAt(0).toUpperCase();
    }

    if (moneyElement) {
        moneyElement.textContent =
            formatMoney(money);
    }

    if (propertyCount) {
        propertyCount.textContent =
            properties;
    }
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0
        }
    );
}

/* =========================================================
   TURNO
========================================================= */

function getCurrentTurnPlayer() {
    if (!Array.isArray(gameState.players)) {
        return null;
    }

    return (
        gameState.players[
            Number(gameState.turnIndex) || 0
        ] || null
    );
}

function isMyTurn() {
    const currentPlayer =
        getCurrentTurnPlayer();

    const ownPlayer =
        findOwnPlayer();

    if (!currentPlayer || !ownPlayer) {
        return false;
    }

    return (
        currentPlayer.id === ownPlayer.id
    );
}

function updateTurnUI() {
    const currentPlayer =
        getCurrentTurnPlayer();

    const ownPlayer =
        findOwnPlayer();

    const turnPlayer =
        document.getElementById("turnPlayer");

    const turnStatus =
        document.getElementById("turnStatus");

    if (turnPlayer) {
        turnPlayer.textContent =
            currentPlayer?.name ||
            "Aguardando...";
    }

    if (!turnStatus) return;

    if (
        currentPlayer &&
        ownPlayer &&
        currentPlayer.id === ownPlayer.id
    ) {
        turnStatus.textContent = "SUA VEZ";
    } else if (currentPlayer) {
        turnStatus.textContent =
            `VEZ DE ${String(
                currentPlayer.name
            ).toUpperCase()}`;
    } else {
        turnStatus.textContent =
            "AGUARDANDO";
    }
}

/* =========================================================
   ROLAR DADOS
========================================================= */

function rollDice() {
    console.log("🎲 ROLAR DADOS CLICADO");

    if (!socket) {
        showGameMessage(
            "Servidor não conectado."
        );
        return;
    }

    if (!socket.connected) {
        showGameMessage(
            "Aguardando conexão com o servidor..."
        );
        return;
    }

    if (gameState.rolling) {
        return;
    }

    if (!isMyTurn()) {
        showGameMessage(
            "Ainda não é a sua vez."
        );
        return;
    }

    if (gameState.phase !== "roll") {
        showGameMessage(
            "Você não pode rolar os dados agora."
        );
        return;
    }

    const button =
        document.getElementById("rollButton");

    if (button) {
        button.disabled = true;
    }

    /*
     * A animação começa imediatamente.
     */

    gameState.rolling = true;
    pendingServerRoll = null;
    diceAnimationStart = Date.now();

    startDiceAnimation();

    const result =
        document.getElementById("diceResult");

    if (result) {
        result.textContent =
            "🎲 OS DADOS ESTÃO ROLANDO...";
    }

    /*
     * Envia a jogada para o servidor.
     */

    socket.emit(
        "game:action",
        {
            code: gameState.roomCode,
            action: "roll",
            payload: {}
        },
        (response) => {
            console.log(
                "Resposta da jogada:",
                response
            );

            if (
                response &&
                response.success === false
            ) {
                stopDiceAnimation();

                gameState.rolling = false;
                pendingServerRoll = null;

                showGameMessage(
                    response.error ||
                    response.message ||
                    "Não foi possível rolar os dados."
                );

                updateActionButtons();

                return;
            }

            if (
                response &&
                response.state &&
                response.state.lastRoll
            ) {
                pendingServerRoll =
                    response.state.lastRoll;

                tryFinishDice();
            }
        }
    );
}

/* =========================================================
   ANIMAÇÃO DOS DADOS
========================================================= */

function startDiceAnimation() {
    stopDiceAnimation();

    const die1 =
        document.getElementById("die1");

    const die2 =
        document.getElementById("die2");

    if (!die1 || !die2) {
        console.error(
            "ERRO: die1 ou die2 não encontrados."
        );
        return;
    }

    /*
     * Coloca a classe que o CSS usa.
     */

    die1.classList.add("rolling");
    die2.classList.add("rolling");

    console.log(
        "🎲 ANIMAÇÃO DOS DADOS INICIADA"
    );

    /*
     * Troca as faces rapidamente durante
     * a rolagem.
     */

    diceAnimation =
        setInterval(() => {
            const first =
                Math.floor(
                    Math.random() * 6
                ) + 1;

            const second =
                Math.floor(
                    Math.random() * 6
                ) + 1;

            showDie(
                die1,
                first
            );

            showDie(
                die2,
                second
            );

            tryFinishDice();
        }, 80);
}

/* =========================================================
   PARAR ANIMAÇÃO
========================================================= */

function stopDiceAnimation() {
    if (diceAnimation) {
        clearInterval(diceAnimation);
        diceAnimation = null;
    }

    const die1 =
        document.getElementById("die1");

    const die2 =
        document.getElementById("die2");

    if (die1) {
        die1.classList.remove("rolling");
    }

    if (die2) {
        die2.classList.remove("rolling");
    }
}

/* =========================================================
   FINALIZAR DADOS
========================================================= */

function tryFinishDice() {
    if (
        !gameState.rolling ||
        !pendingServerRoll
    ) {
        return;
    }

    const elapsed =
        Date.now() -
        diceAnimationStart;

    /*
     * Pelo menos 900ms de animação.
     */

    if (elapsed < 900) {
        return;
    }

    finishDice(
        pendingServerRoll
    );
}

function finishDice(roll) {
    if (!roll) return;

    stopDiceAnimation();

    const first =
        Number(roll.first);

    const second =
        Number(roll.second);

    const total =
        Number(
            roll.total ??
            (first + second)
        );

    showDie(
        document.getElementById("die1"),
        first
    );

    showDie(
        document.getElementById("die2"),
        second
    );

    const result =
        document.getElementById("diceResult");

    if (result) {
        result.textContent =
            `🎲 Você tirou ${first} + ${second} = ${total}`;
    }

    gameState.rolling = false;
    gameState.lastRoll = roll;
    pendingServerRoll = null;

    updateActionButtons();
}

/* =========================================================
   ATUALIZAR DADOS
========================================================= */

function updateDiceFromState() {
    if (!gameState.lastRoll) {
        return;
    }

    if (diceAnimation) {
        return;
    }

    const roll =
        gameState.lastRoll;

    showDie(
        document.getElementById("die1"),
        roll.first
    );

    showDie(
        document.getElementById("die2"),
        roll.second
    );

    const result =
        document.getElementById("diceResult");

    if (result) {
        const first = Number(roll.first);
        const second = Number(roll.second);
        const total = Number(
            roll.total ??
            (first + second)
        );

        result.textContent =
            `🎲 Você tirou ${first} + ${second} = ${total}`;
    }
}

function showDie(element, value) {
    if (!element) return;

    const face =
        element.querySelector(".face");

    if (!face) return;

    face.textContent =
        diceFaces[Number(value)] ||
        "⚄";
}

/* =========================================================
   JOGADORES
========================================================= */

function renderPlayers() {
    if (!Array.isArray(gameState.players)) {
        return;
    }

    const validIds =
        new Set(
            gameState.players.map(
                (player) => String(player.id)
            )
        );

    document
        .querySelectorAll(".player-piece")
        .forEach((piece) => {
            const id =
                String(piece.dataset.player);

            if (!validIds.has(id)) {
                piece.remove();
            }
        });

    gameState.players.forEach((player) => {
        if (!player) return;

        const oldPlayer =
            previousPlayers.find(
                (old) => old.id === player.id
            );

        const oldPosition =
            Number(
                oldPlayer?.position ??
                player.position ??
                0
            );

        const newPosition =
            Number(
                player.position ?? 0
            );

        if (
            oldPlayer &&
            oldPosition !== newPosition
        ) {
            animatePlayerMovement(
                player,
                oldPosition,
                newPosition
            );
        } else {
            movePlayerPiece(
                player.id,
                newPosition,
                player.color,
                player.name
            );
        }
    });
}

/* =========================================================
   ANIMAÇÃO DA PEÇA
========================================================= */

function animatePlayerMovement(
    player,
    oldPosition,
    newPosition
) {
    const playerId =
        String(player.id);

    if (pieceTimers.has(playerId)) {
        clearInterval(
            pieceTimers.get(playerId)
        );
    }

    let current =
        Number(oldPosition) || 0;

    const target =
        Number(newPosition) || 0;

    movePlayerPiece(
        player.id,
        current,
        player.color,
        player.name
    );

    if (current === target) {
        return;
    }

    const interval =
        setInterval(() => {
            current =
                (current + 1) % 40;

            movePlayerPiece(
                player.id,
                current,
                player.color,
                player.name
            );

            if (current === target) {
                clearInterval(interval);

                pieceTimers.delete(
                    playerId
                );

                if (
                    String(player.id) ===
                    String(gameState.playerId)
                ) {
                    setTimeout(() => {
                        showLandingMessage(
                            target
                        );
                    }, 150);
                }
            }
        }, 180);

    pieceTimers.set(
        playerId,
        interval
    );
}

/* =========================================================
   COLOCAR PEÇA
========================================================= */

function movePlayerPiece(
    playerId,
    position,
    color,
    name
) {
    if (
        playerId === undefined ||
        playerId === null
    ) {
        return;
    }

    const id =
        String(playerId);

    document
        .querySelectorAll(".player-piece")
        .forEach((piece) => {
            if (
                String(piece.dataset.player) === id
            ) {
                piece.remove();
            }
        });

    const cell =
        document.querySelector(
            `[data-position="${Number(position)}"]`
        );

    if (!cell) return;

    let container =
        cell.querySelector(".player-pieces");

    if (!container) {
        container =
            document.createElement("div");

        container.className =
            "player-pieces";

        cell.appendChild(container);
    }

    const piece =
        document.createElement("div");

    piece.className =
        "player-piece";

    piece.dataset.player =
        id;

    piece.title =
        name || "Jogador";

    const playerColor =
        color || "#e2b94f";

    piece.style.background =
        `linear-gradient(
            135deg,
            ${playerColor},
            ${darkenColor(playerColor)}
        )`;

    piece.style.borderColor =
        "#ffffff";

    piece.style.boxShadow =
        `0 3px 8px rgba(0,0,0,.6),
         0 0 10px ${playerColor}`;

    container.appendChild(piece);
}

/* =========================================================
   ESCURECER COR
========================================================= */

function darkenColor(color) {
    if (typeof color !== "string") {
        return "#777777";
    }

    let hex =
        color.replace("#", "");

    if (hex.length !== 6) {
        return color;
    }

    const amount = 0.65;

    const r =
        Math.floor(
            parseInt(
                hex.substring(0, 2),
                16
            ) * amount
        );

    const g =
        Math.floor(
            parseInt(
                hex.substring(2, 4),
                16
            ) * amount
        );

    const b =
        Math.floor(
            parseInt(
                hex.substring(4, 6),
                16
            ) * amount
        );

    return (
        "#" +
        [r, g, b]
            .map((value) =>
                value
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
    );
}

/* =========================================================
   MENSAGEM DA CASA
========================================================= */

function showLandingMessage(position) {
    const property =
        getPropertyByPosition(position);

    const cell =
        document.querySelector(
            `[data-position="${Number(position)}"]`
        );

    const result =
        document.getElementById("diceResult");

    if (!result) return;

    if (property) {
        result.textContent =
            `Você chegou em ${property.name}`;

        return;
    }

    if (cell) {
        const name =
            cell.querySelector("strong");

        if (name) {
            result.textContent =
                `Você chegou em ${name.textContent}`;
        }
    }
}

/* =========================================================
   PROPRIEDADES
========================================================= */

function getPropertyByPosition(position) {
    if (!Array.isArray(gameState.properties)) {
        return null;
    }

    return (
        gameState.properties.find(
            (property) =>
                Number(property.id) ===
                Number(position)
        ) || null
    );
}

function renderPropertyOwnership() {
    const cells =
        document.querySelectorAll(
            "[data-position]"
        );

    cells.forEach((cell) => {
        const position =
            Number(cell.dataset.position);

        cell
            .querySelectorAll(
                ".property-owner-marker, .property-upgrade-marker"
            )
            .forEach((element) =>
                element.remove()
            );

        const owner =
            gameState.players.find(
                (player) =>
                    Array.isArray(
                        player.properties
                    ) &&
                    player.properties.includes(
                        position
                    )
            );

        if (!owner) return;

        const marker =
            document.createElement("div");

        marker.className =
            "property-owner-marker";

        marker.title =
            `Proprietário: ${owner.name}`;

        marker.style.position =
            "absolute";

        marker.style.top =
            "3px";

        marker.style.left =
            "3px";

        marker.style.width =
            "12px";

        marker.style.height =
            "12px";

        marker.style.borderRadius =
            "50%";

        marker.style.background =
            owner.color || "#e2b94f";

        marker.style.border =
            "2px solid #ffffff";

        marker.style.zIndex =
            "10";

        cell.style.position =
            "relative";

        cell.appendChild(marker);

        const houses =
            Number(
                owner.houses?.[position] || 0
            );

        const hotels =
            Number(
                owner.hotels?.[position] || 0
            );

        if (houses <= 0 && hotels <= 0) {
            return;
        }

        const upgrade =
            document.createElement("div");

        upgrade.className =
            "property-upgrade-marker";

        upgrade.style.position =
            "absolute";

        upgrade.style.top =
            "2px";

        upgrade.style.right =
            "2px";

        upgrade.style.fontSize =
            "9px";

        upgrade.style.fontWeight =
            "900";

        upgrade.style.zIndex =
            "10";

        upgrade.style.background =
            "rgba(0,0,0,.72)";

        upgrade.style.color =
            "#ffffff";

        upgrade.style.padding =
            "2px 4px";

        upgrade.style.borderRadius =
            "5px";

        if (hotels > 0) {
            upgrade.textContent =
                "🏨";

            upgrade.title =
                `Hotel: ${owner.name}`;
        } else {
            upgrade.textContent =
                `🏠 × ${houses}`;

            upgrade.title =
                `${houses} casa(s): ${owner.name}`;
        }

        cell.appendChild(upgrade);
    });
}

/* =========================================================
   JOGADORES ONLINE
========================================================= */

function updatePlayersCount() {
    const element =
        document.getElementById(
            "onlinePlayers"
        );

    if (!element) return;

    const count =
        Array.isArray(gameState.players)
            ? gameState.players.length
            : 0;

    element.textContent =
        `${count} / 8`;
}

/* =========================================================
   BOTÕES
========================================================= */

function setupActionButtons() {
    const rollButton =
        document.getElementById(
            "rollButton"
        );

    if (!rollButton) {
        console.warn(
            "Botão #rollButton não encontrado."
        );
    }

    let container =
        document.getElementById(
            "gameActionButtons"
        );

    if (!container && rollButton) {
        container =
            document.createElement("div");

        container.id =
            "gameActionButtons";

        container.style.display =
            "flex";

        container.style.flexWrap =
            "wrap";

        container.style.justifyContent =
            "center";

        container.style.gap =
            "8px";

        container.style.marginTop =
            "10px";

        rollButton.parentElement?.appendChild(
            container
        );
    }

    if (!container) return;

    createActionButton(
        container,
        "buyPropertyButton",
        "🏠 COMPRAR",
        buyCurrentProperty
    );

    createActionButton(
        container,
        "skipBuyButton",
        "PASSAR",
        skipBuy
    );

    createActionButton(
        container,
        "endTurnButton",
        "✓ FINALIZAR TURNO",
        endTurn
    );
}

function createActionButton(
    container,
    id,
    text,
    callback
) {
    let button =
        document.getElementById(id);

    if (button) return button;

    button =
        document.createElement("button");

    button.id =
        id;

    button.type =
        "button";

    button.textContent =
        text;

    button.addEventListener(
        "click",
        callback
    );

    button.style.display =
        "none";

    button.style.padding =
        "9px 14px";

    button.style.borderRadius =
        "10px";

    button.style.border =
        "1px solid rgba(226,185,79,.6)";

    button.style.background =
        "linear-gradient(135deg,#172b43,#0a192b)";

    button.style.color =
        "#f5d77c";

    button.style.fontWeight =
        "800";

    button.style.cursor =
        "pointer";

    container.appendChild(button);

    return button;
}

function updateActionButtons() {
    setupActionButtons();

    const buyButton =
        document.getElementById(
            "buyPropertyButton"
        );

    const skipButton =
        document.getElementById(
            "skipBuyButton"
        );

    const endButton =
        document.getElementById(
            "endTurnButton"
        );

    const rollButton =
        document.getElementById(
            "rollButton"
        );

    const myTurn =
        isMyTurn();

    if (rollButton) {
        rollButton.disabled =
            !myTurn ||
            gameState.phase !== "roll" ||
            gameState.rolling;
    }

    if (buyButton) {
        buyButton.style.display =
            myTurn &&
            gameState.phase === "buy"
                ? "inline-block"
                : "none";
    }

    if (skipButton) {
        skipButton.style.display =
            myTurn &&
            gameState.phase === "buy"
                ? "inline-block"
                : "none";
    }

    if (endButton) {
        endButton.style.display =
            myTurn &&
            (
                gameState.phase === "end" ||
                gameState.phase === "roll-again"
            )
                ? "inline-block"
                : "none";

        endButton.textContent =
            gameState.phase === "roll-again"
                ? "🎲 JOGAR NOVAMENTE"
                : "✓ FINALIZAR TURNO";
    }
}

/* =========================================================
   AÇÃO DO SERVIDOR
========================================================= */

function sendGameAction(
    action,
    payload = {},
    callback
) {
    if (!socket) {
        showGameMessage(
            "Servidor não conectado."
        );

        return;
    }

    if (!socket.connected) {
        showGameMessage(
            "A conexão com o servidor foi perdida."
        );

        return;
    }

    socket.emit(
        "game:action",
        {
            code: gameState.roomCode,
            action,
            payload
        },
        (response) => {
            if (
                response &&
                response.success === false
            ) {
                showGameMessage(
                    response.error ||
                    response.message ||
                    "Não foi possível realizar essa ação."
                );
            }

            if (
                typeof callback ===
                "function"
            ) {
                callback(response);
            }
        }
    );
}

/* =========================================================
   COMPRAR
========================================================= */

function buyCurrentProperty() {
    if (!isMyTurn()) return;

    if (gameState.phase !== "buy") {
        return;
    }

    sendGameAction("buy");
}

function skipBuy() {
    if (!isMyTurn()) return;

    if (gameState.phase !== "buy") {
        return;
    }

    sendGameAction("skip-buy");
}

function endTurn() {
    if (!isMyTurn()) return;

    if (
        gameState.phase !== "end" &&
        gameState.phase !== "roll-again"
    ) {
        return;
    }

    sendGameAction("end-turn");
}

/* =========================================================
   MENSAGEM
========================================================= */

function showGameMessage(message) {
    const result =
        document.getElementById(
            "diceResult"
        );

    if (result) {
        result.textContent =
            message;
    }

    console.log("GAME:", message);
}

/* =========================================================
   CHAT
========================================================= */

function setupChat() {
    const input =
        document.getElementById(
            "chatInput"
        );

    if (!input) return;

    input.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendChat();
            }
        }
    );
}

function sendChat() {
    const input =
        document.getElementById(
            "chatInput"
        );

    if (!input) return;

    const message =
        input.value.trim();

    if (!message) return;

    if (
        !socket ||
        !socket.connected
    ) {
        showGameMessage(
            "Você está sem conexão."
        );

        return;
    }

    socket.emit(
        "chat:send",
        {
            code: gameState.roomCode,
            text: message
        }
    );

    input.value = "";
}

function addChatMessage(
    name,
    message,
    color
) {
    const container =
        document.getElementById(
            "chatMessages"
        );

    if (!container) return;

    const element =
        document.createElement("div");

    element.className =
        "chat-message";

    const strong =
        document.createElement("strong");

    strong.textContent =
        `${name}:`;

    if (color) {
        strong.style.color =
            color;
    }

    const text =
        document.createTextNode(
            ` ${message}`
        );

    element.appendChild(strong);
    element.appendChild(text);

    container.appendChild(element);

    container.scrollTop =
        container.scrollHeight;
}

/* =========================================================
   NAVEGAÇÃO
========================================================= */

function goLobby() {
    window.location.href =
        "lobby.html";
}

function openProfile() {
    window.location.href =
        "profile.html";
}

function openShop() {
    window.location.href =
        "shop.html";
}

function openSettings() {
    window.location.href =
        "settings.html";
}

function openHelp() {
    window.location.href =
        "tutorial.html";
}

function openCredits() {
    window.location.href =
        "credits.html";
}

/* =========================================================
   DISPONIBILIZAR FUNÇÕES GLOBALMENTE
========================================================= */

window.rollDice = rollDice;
window.buyCurrentProperty = buyCurrentProperty;
window.skipBuy = skipBuy;
window.endTurn = endTurn;
window.goLobby = goLobby;
window.openProfile = openProfile;
window.openShop = openShop;
window.openSettings = openSettings;
window.openHelp = openHelp;
window.openCredits = openCredits;