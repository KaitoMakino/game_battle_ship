window.addEventListener('DOMContentLoaded', () => {
    const introContainer = document.getElementById('intro-container');
    const titleContainer = document.getElementById('title-container');
    const buttonContainer = document.getElementById('button-container');
    const startButton = document.getElementById('start-button');
    const gameContainer = document.getElementById('game-container');
    const gameBoard1 = document.getElementById('gameBoard1'); // プレイヤー1の盤面
    const gameBoard2 = document.getElementById('gameBoard2'); // プレイヤー2の盤面
    const turnIndicator = document.getElementById('turn-indicator');
    const winMessage = document.getElementById('win-message'); // 勝利メッセージ
    const backToTitleButton = document.getElementById('back-to-title'); // タイトルへ戻るボタン

    // BGM要素
    const bgmTitle = document.getElementById('bgm-title');
    const bgmBattle = document.getElementById('bgm-battle');

    // プレイヤー情報
    let currentPlayer = 1; // 1: プレイヤー1, 2: プレイヤー2
    let player1Ships = [];
    let player2Ships = [];
    let attackCount = 0;
    let gamePhase = "setup"; // "setup"（配置）, "attack"（攻撃）
    let attackHistory1 = {}; // プレイヤー1の攻撃履歴
    let attackHistory2 = {}; // プレイヤー2の攻撃履歴

    /* イントロ画面をタッチしたら、タイトル画面を表示してBGM再生 */
    introContainer.addEventListener('click', () => {
        introContainer.style.display = 'none';
        titleContainer.style.display = 'flex';
        buttonContainer.style.display = 'flex';

        // タイトルBGMを再生
        bgmTitle.play().catch(err => {
            console.log('Autoplay was prevented:', err);
        });
    });

    // 「GAME START」ボタンクリック時の処理
    startButton.addEventListener('click', () => {
        // BGMをバトル用に変更
        bgmTitle.pause();
        bgmTitle.currentTime = 0;
        bgmBattle.play().catch(err => {
            console.log('Autoplay was prevented:', err);
        });

        // タイトル関連を隠してゲーム画面を表示
        titleContainer.style.display = 'none';
        buttonContainer.style.display = 'none';
        gameContainer.style.display = 'block';

        startMainGame();
    });

    function startMainGame() {
        // 初期化
        currentPlayer = 1;
        player1Ships = [];
        player2Ships = [];
        attackCount = 0;
        gamePhase = "setup";
        attackHistory1 = {};
        attackHistory2 = {};

        winMessage.style.display = "none";
        backToTitleButton.style.display = "none";

        // ターン表示
        turnIndicator.textContent = "プレイヤー1の番です。船の位置を5つまで決めてください";
        turnIndicator.style.display = "block";

        // 5×5のマスを作成
        createGrid(gameBoard1, 1);
        createGrid(gameBoard2, 2);

        // 最初はプレイヤー1の盤面を表示
        gameBoard1.style.display = "grid";
        gameBoard2.style.display = "none";
    }

    function createGrid(gameBoard, player) {
        gameBoard.innerHTML = ''; // 既存の要素を削除
        gameBoard.style.backgroundImage = 'url("images/sea.png")'; // 直接背景設定
        gameBoard.style.backgroundSize = '64px 64px';

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.style.backgroundImage = 'url("images/sea.png")';
                cell.style.backgroundSize = '64px 64px';

                // 配置フェーズ
                if (player === 1) {
                    cell.addEventListener('click', (e) => handleCellClick(e, cell, i, j, 1));
                } else {
                    cell.addEventListener('click', (e) => handleCellClick(e, cell, i, j, 2));
                }

                gameBoard.appendChild(cell);
            }
        }
    }

    function checkVictory() {
        let attackHistory = currentPlayer === 1 ? attackHistory1 : attackHistory2;
        let opponentShips = currentPlayer === 1 ? player2Ships : player1Ships;

        let allShipsHit = opponentShips.every(ship => {
            return attackHistory[`${ship.row}-${ship.col}`] === "hit";
        });

        if (allShipsHit) {
            winMessage.textContent = `プレイヤー${currentPlayer}の勝利！`;
            winMessage.style.display = "block";
            backToTitleButton.style.display = "block";
            return true;
        }
        return false;
    }

    function handleCellClick(e, cell, row, col, player) {
        e.stopPropagation();

        if (gamePhase === "setup") {
            if (player === 1 && currentPlayer === 1 && player1Ships.length < 5) {
                cell.style.backgroundImage = 'url("images/ship.png")';
                player1Ships.push({ row, col });

                if (player1Ships.length === 5) {
                    setTimeout(() => switchToPlayer2(), 500);
                }
            } else if (player === 2 && currentPlayer === 2 && player2Ships.length < 5) {
                cell.style.backgroundImage = 'url("images/ship.png")';
                player2Ships.push({ row, col });

                if (player2Ships.length === 5) {
                    setTimeout(() => startAttackPhase(), 500);
                }
            }
        }
    }

    function switchToPlayer2() {
        currentPlayer = 2;
        turnIndicator.textContent = "プレイヤー2の番です。船の位置を5つまで決めてください";

        // プレイヤー1の盤面を非表示、プレイヤー2の盤面を表示
        gameBoard1.style.display = "none";
        gameBoard2.style.display = "grid";
    }

    function startAttackPhase() {
        gamePhase = "attack";
        currentPlayer = 1;
        turnIndicator.textContent = "プレイヤー1のターンです。3箇所を攻撃してください";

        updateBoards();
    }

    function updateBoards() {
        let attackBoard = currentPlayer === 1 ? gameBoard2 : gameBoard1;
        let attackHistory = currentPlayer === 1 ? attackHistory1 : attackHistory2;

        attackBoard.style.display = "grid";

        attackBoard.querySelectorAll('.cell').forEach(cell => {
            let row = cell.dataset.row;
            let col = cell.dataset.col;
            let cellKey = `${row}-${col}`;

            if (attackHistory[cellKey] === "hit") {
                cell.style.backgroundImage = 'url("images/ship.png")';
            } else if (attackHistory[cellKey] === "miss") {
                cell.style.backgroundImage = 'url("images/sea.png")';
            } else {
                cell.style.backgroundImage = 'url("images/cloud.png")';
                cell.addEventListener('click', handleAttack, { once: true });
            }
        });

        let hideBoard = currentPlayer === 1 ? gameBoard1 : gameBoard2;
        hideBoard.style.display = "none";
    }

    function handleAttack(e) {
        e.stopPropagation();

        let cell = e.target;
        let row = parseInt(cell.dataset.row);
        let col = parseInt(cell.dataset.col);
        let attackHistory = currentPlayer === 1 ? attackHistory1 : attackHistory2;
        let opponentShips = currentPlayer === 1 ? player2Ships : player1Ships;
        let cellKey = `${row}-${col}`;

        if (!attackHistory[cellKey]) {
            attackCount++;

            if (opponentShips.some(ship => ship.row === row && ship.col === col)) {
                cell.style.backgroundImage = 'url("images/ship.png")';
                attackHistory[cellKey] = "hit";
            } else {
                cell.style.backgroundImage = 'url("images/sea.png")';
                attackHistory[cellKey] = "miss";
            }

            if (checkVictory()) return; // 勝利判定

            if (attackCount === 3) {
                attackCount = 0;
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                turnIndicator.textContent = `プレイヤー${currentPlayer}のターンです。3箇所を攻撃してください`;
                setTimeout(updateBoards, 1000);
            }
        }
    }

    // タイトルへ戻る処理
    backToTitleButton.addEventListener('click', () => {
        gameContainer.style.display = 'none';
        titleContainer.style.display = 'flex';
        buttonContainer.style.display = 'flex';

        bgmBattle.pause();
        bgmBattle.currentTime = 0;
        bgmTitle.play().catch(err => {
            console.log('Autoplay was prevented:', err);
        });

        // 「タイトルへ戻る」ボタンを非表示にする
        backToTitleButton.style.display = "none";
        winMessage.style.display = "none";
        turnIndicator.style.display = "none";
    });
});
