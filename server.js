// server.js

// 1. Configuração Básica
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Define a pasta 'public' como o local dos arquivos do jogo
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 2. Estado do Jogo (agora mora no servidor)
const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 4000;
let players = {};
let food = [];

// Função para gerar comida
function generateFood(count) {
    for (let i = 0; i < count; i++) {
        food.push({
            id: Math.random(),
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            radius: 5,
            color: `hsl(${Math.random() * 360}, 90%, 70%)`
        });
    }
}

generateFood(400); // Gera a comida inicial

// 3. Lógica de Conexão com os Jogadores
io.on('connection', (socket) => {
    console.log('Um jogador conectou:', socket.id);

    // Cria um novo jogador
    players[socket.id] = {
        id: socket.id,
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        radius: Math.sqrt(200),
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        name: 'Anônimo'
        // Adicionar futuramente: level, xp, etc.
    };

    // Recebe o nome do jogador quando ele clica em "Iniciar"
    socket.on('startGame', (playerData) => {
        if (players[socket.id]) {
            players[socket.id].name = playerData.name;
        }
    });

    // Recebe as ações do jogador (movimento do mouse)
    socket.on('playerInput', (direction) => {
        const player = players[socket.id];
        if (!player) return;

        const speed = 3.8 / (1 + player.radius * 0.02);
        player.x += Math.cos(direction.angle) * speed;
        player.y += Math.sin(direction.angle) * speed;

        // Manter o jogador dentro do mapa
        player.x = Math.max(player.radius, Math.min(WORLD_WIDTH - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(WORLD_HEIGHT - player.radius, player.y));
    });

    // Ouve o evento de desconexão
    socket.on('disconnect', () => {
        console.log('Jogador desconectou:', socket.id);
        delete players[socket.id]; // Remove o jogador da lista
    });
});

// 4. Game Loop do Servidor
setInterval(() => {
    // Aqui você adicionaria a lógica de colisão, movimento de IAs, etc.
    // Por enquanto, vamos apenas enviar o estado atualizado.
    
    // Envia o estado do jogo para TODOS os jogadores conectados
    io.emit('gameState', { players, food });
}, 16); // Roda a ~60fps

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}!`));