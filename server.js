// server.js

// 1. Configuração do Servidor
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

// =======================================================================
// 2. LÓGICA DO JOGO (Movida do cliente para o servidor)
// =======================================================================

// --- Constantes do Jogo ---
const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 4000;
const NUM_FOOD = 400;
const NUM_VIRUSES = 15;
const NUM_FEEDER_VIRUSES = 5;
const DONATE_MASS_AMOUNT = 40;
const MIN_MASS_TO_DONATE = 80;
const MIN_MASS_TO_SPLIT = 400;
const MAX_PLAYER_CELLS = 16;


// --- Estado do Jogo ---
let players = {};
let food = [];
let viruses = [];
let feederViruses = [];
let ejectedMasses = [];
let animationTick = 0;

// --- Classes do Jogo ---
// (Estas são as mesmas classes do seu jogo, agora no servidor)
class Entity {
    constructor(x, y, radius, color) {
        this.x = x; this.y = y; this.radius = radius; this.color = color;
        this.mass = this.radius * this.radius;
        this.id = Math.random();
    }
    updateRadius() { this.radius = Math.sqrt(this.mass); }
}

class Cell extends Entity {
    constructor(x, y, radius, color, name = '') {
        super(x, y, radius, color);
        this.name = name;
        this.cells = [
            { x: x, y: y, radius: radius, mass: this.mass, id: Math.random() }
        ];
        this.vx = 0; this.vy = 0;
        this.direction = { angle: 0, magnitude: 0 };
        this.level = 1; this.xp = 0;
        this.xpToNextLevel = calculateXPForLevel(1);
    }
}

class Player extends Cell {
    constructor(socketId, name) {
        const x = Math.random() * WORLD_WIDTH;
        const y = Math.random() * WORLD_HEIGHT;
        const radius = Math.sqrt(200);
        super(x, y, radius, `hsl(${Math.random() * 360}, 100%, 50%)`, name);
        this.socketId = socketId;
    }
}

class FoodEntity extends Entity {
    constructor(x, y) {
        super(x, y, 5, `hsl(${Math.random() * 360}, 90%, 70%)`);
    }
}

class EjectedMassEntity extends Entity {
    constructor(x, y, color, direction, speed = 25) {
        super(x, y, Math.sqrt(DONATE_MASS_AMOUNT), color);
        this.ejection = { dx: Math.cos(direction.angle) * speed, dy: Math.sin(direction.angle) * speed, decay: 0.95 };
    }
    update() {
        if (this.ejection) {
            this.x += this.ejection.dx; this.y += this.ejection.dy;
            this.ejection.dx *= this.ejection.decay; this.ejection.dy *= this.ejection.decay;
        }
    }
}

// --- Funções de Lógica ---
function calculateXPForLevel(level) {
    if (level >= 50) return Infinity;
    return Math.floor(100 * Math.pow(1.15, level - 1));
}

function gameTick() {
    animationTick++;

    // Mover massa ejetada
    ejectedMasses.forEach(mass => mass.update());

    // Mover jogadores
    for (const id in players) {
        const player = players[id];
        const levelSpeedBonus = 1 + (player.level - 1) * 0.01;
        const baseSpeed = 3.8 * levelSpeedBonus;
        const speed = baseSpeed / (1 + player.radius * 0.02); // Exemplo, a lógica de múltiplas células seria mais complexa

        player.x += Math.cos(player.direction.angle) * speed * player.direction.magnitude;
        player.y += Math.sin(player.direction.angle) * speed * player.direction.magnitude;

        player.x = Math.max(player.radius, Math.min(WORLD_WIDTH - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(WORLD_HEIGHT - player.radius, player.y));
    }

    // Lógica de colisão (simplificada para o exemplo)
    for (const playerId in players) {
        const player = players[playerId];
        // Colisão Jogador vs Comida
        for (let i = food.length - 1; i >= 0; i--) {
            const f = food[i];
            const dist = Math.hypot(player.x - f.x, player.y - f.y);
            if (dist < player.radius) {
                player.mass += f.mass;
                player.updateRadius();
                food.splice(i, 1);
            }
        }
    }

    // Repopular comida
    if (food.length < NUM_FOOD) {
        generateFood(1);
    }

    // Enviar o estado atualizado para todos
    io.emit('gameState', { players, food, ejectedMasses, viruses, feederViruses });
}

// --- Inicialização do Jogo ---
function startGameServer() {
    generateFood(NUM_FOOD);
    // Gerar vírus, etc.
    setInterval(gameTick, 16); // O loop principal do jogo
}


// =======================================================================
// 3. LÓGICA DE REDE (Socket.IO)
// =======================================================================
io.on('connection', (socket) => {
    console.log('Um jogador conectou:', socket.id);

    // Quando o jogador clica em "Iniciar" no cliente
    socket.on('startGame', (playerData) => {
        players[socket.id] = new Player(socket.id, playerData.name);
        console.log('Jogador', playerData.name, 'entrou no jogo.');
    });

    // Recebe o input de movimento do jogador
    socket.on('playerInput', (direction) => {
        const player = players[socket.id];
        if (player) {
            player.direction = direction;
        }
    });

    // Ouve o evento de desconexão
    socket.on('disconnect', () => {
        console.log('Jogador desconectou:', socket.id);
        delete players[socket.id];
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}!`);
    startGameServer();
});
