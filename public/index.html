<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Microcosmo: Evolução Multiplayer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
    <!-- Adiciona o script do Socket.IO -->
    <script src="/socket.io/socket.io.js"></script>
    <style>
        :root {
            --bg-color: #f0f2f5; --canvas-bg: #ffffff; --text-color: #333;
            --arrow-color: rgba(0, 0, 0, 0.4); --panel-bg: rgba(255, 255, 255, 0.7);
            --panel-border: rgba(0, 0, 0, 0.1);
        }
        body.dark-theme {
            --bg-color: #1a202c; --canvas-bg: #2d3748; --text-color: #edf2f7;
            --arrow-color: rgba(255, 255, 255, 0.5); --panel-bg: rgba(45, 55, 72, 0.7);
            --panel-border: rgba(255, 255, 255, 0.1);
        }
        html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
        body { font-family: 'Orbitron', sans-serif; background-color: var(--bg-color); color: var(--text-color); transition: background-color 0.3s, color 0.3s; }
        canvas { display: block; background-color: var(--canvas-bg); cursor: none; width: 100%; height: 100%; transition: background-color 0.3s; }
        #startScreen, #gameOverScreen { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        body.dark-theme #startScreen, body.dark-theme #gameOverScreen { background: rgba(26, 32, 44, 0.8); }
        .ui-panel { background: var(--panel-bg); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border: 1px solid var(--panel-border); border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s, border-color 0.3s; }
        .hidden { display: none !important; }
    </style>
</head>
<body class="text-gray-800">

    <!-- Tela de Início -->
    <div id="startScreen" class="absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500">
        <div class="text-center p-8 sm:p-12 ui-panel w-11/12 max-w-2xl">
            <h1 class="text-5xl sm:text-7xl font-bold text-gray-800 mb-2">MICROCOSMO</h1>
            <p class="text-lg text-gray-600 mb-4">Entre no mundo multiplayer</p>
            <input type="text" id="playerNameInput" placeholder="Seu Nome" class="bg-gray-100 text-gray-800 placeholder-gray-500 border-2 border-gray-300 rounded-lg px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full">
            <button id="startButton" class="mt-6 font-bold rounded-lg px-8 py-3 text-lg transform hover:scale-105 w-full bg-blue-500 text-white">INICIAR JOGO</button>
        </div>
    </div>

    <canvas id="gameCanvas"></canvas>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const ui = {
            startScreen: document.getElementById('startScreen'),
            playerNameInput: document.getElementById('playerNameInput'),
            startButton: document.getElementById('startButton'),
        };

        // --- Variáveis do Cliente ---
        const socket = io();
        let serverState = { players: {}, food: [] };
        let myId = null;
        let animationFrameId;
        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        // --- Lógica de Rede ---
        socket.on('connect', () => {
            myId = socket.id;
            console.log('Conectado ao servidor com o ID:', myId);
        });

        socket.on('gameState', (state) => {
            serverState = state;
        });

        // --- Funções do Jogo (Cliente) ---
        function init() {
            ui.startScreen.classList.add('hidden');
            socket.emit('startGame', { name: ui.playerNameInput.value.trim() || 'Anônimo' });
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animate();
        }

        function getPlayerDirection() {
            let angle = 0, magnitude = 0;
            const dx = mouse.x - window.innerWidth / 2;
            const dy = mouse.y - window.innerHeight / 2;
            angle = Math.atan2(dy, dx);
            if (dx !== 0 || dy !== 0) magnitude = 1;
            return { angle, magnitude };
        }

        // --- Loop de Renderização ---
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            if (!myId || !serverState.players[myId]) return;

            // Envia o input do jogador para o servidor
            socket.emit('playerInput', getPlayerDirection());

            // Limpa a tela
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Lógica da Câmera
            const me = serverState.players[myId];
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            const zoom = 200 / (me.radius + 100);
            ctx.scale(zoom, zoom);
            ctx.translate(-me.x, -me.y);

            // Desenha a comida
            serverState.food.forEach(f => {
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fillStyle = f.color;
                ctx.fill();
            });

            // Desenha os jogadores
            for (const id in serverState.players) {
                const player = serverState.players[id];
                ctx.beginPath();
                ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
                ctx.fillStyle = player.color;
                ctx.fill();

                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 16px Orbitron';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(player.name, player.x, player.y);
            }
            
            ctx.restore();
        }

        // --- Event Listeners ---
        ui.startButton.addEventListener('click', init);
        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }, { passive: true });

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

    </script>
</body>
</html>
