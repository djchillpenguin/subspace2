var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');
    players[socket.id] = {
        rotation: 0,
        x: 800,
        y: 800,
        playerId: socket.id,
        vel: { x: 0, y: 0 }
    };

    socket.emit('currentPlayers', players);

    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', function () {
        console.log('user disconnected');

        delete players[socket.id];

        io.emit('disconnect', socket.id);
    });

    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].vel = movementData.vel;
        players[socket.id].rotation = movementData.rotation;
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('shotFired', function () {
        socket.broadcast.emit('enemyFired', players[socket.id]);
    });
});

server.listen(process.env.PORT || 5000, function () {
    console.log(`Listening on ${server.address().port}`);
});
