var path = require('path');
var express = require('express');
const { Socket } = require('dgram');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var htmlPath = path.join(__dirname,'assets/games/germs/');
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
/*
app.get('/assets/games/germs/', (req, res) => {
res.sendFile(htmlPath+'background.png');
res.sendFile(htmlPath+'germs.json');
res.sendFile(htmlPath+'germs.png');
res.sendFile(htmlPath+'goo.glsl.js');
res.sendFile(htmlPath+'laugh.ogg');
res.sendFile(htmlPath+'slime-font.png');
res.sendFile(htmlPath+'slime-font.xml');
});
*/
app.use('/assets',express.static(path.join(__dirname,'assets')));
var counter = 0;
var players = [];
var firstChosen = false;
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.playerNumber = 0;
  io.emit('connected');
  counter++;
  socket.on('arethereusers', () => {
    if (counter >= 2) {
      io.emit('thereareusers');
    }
  });
var counterAssure = 0;
  socket.on('placemyplayer', (player, speed, target, rotation) => {
    player.speed = speed;
    player.target = target;
    player.rotation = rotation;
    players.push(player);
    console.log(player);
    socket.playerNumber = players.length - 1;
    console.log(socket.playerNumber);
    console.log("Player added succesfully!");
    io.emit('hereisyoursocketid', socket.playerNumber);
    
  });
socket.on('getmeallplayers', () => {
    io.emit('heretheyare', players, "all");
    console.log("Players sent succesfully!");
  });
socket.on('updatemyplayer', (player, target, speed, rotation) => {
  players[socket.playerNumber] = player;
  players[socket.playerNumber].target = target;
  players[socket.playerNumber].speed = speed;
  players[socket.playerNumber].rotation = rotation;
  console.log(players[socket.playerNumber]);
  console.log("Player updated succesfully");
  io.sockets.emit('heretheyareupdated', players);
});
socket.on('updatemyplayertochecktostop', (player, target) => {
socket.broadcast.emit('checkifstopped', player, target);
});
socket.on('amithefirstplayer', () => {
if (firstChosen) {
} else {
firstChosen = true;
io.emit('youarethefirstplayer');
}
});
socket.on('updatemyplayerfirsttime', (player) => {
  players[socket.playerNumber] = player;
  console.log("Player updated succesfully");
  io.sockets.emit('heretheyare', players);
});
socket.on('ibegan', () => {
socket.broadcast.emit('istarted');
});
socket.on('myspeedis0', () => {
socket.broadcast.emit('stoptheother');
})
socket.on('iamplayer2', () => {
io.emit('takethis');
});
socket.on('deletemyplayer', () => {
players = players.filter(i => i != players[socket.playerNumber]);
firstChosen = false;
if (players.length === 1) {
players.pop();
}
console.log("Player deleted succesfully!");
if (players.length > 0) {
}
io.sockets.emit('heretheyaredeleted', players, "all");
});
socket.on('gameoverforme', () => {
socket.broadcast.emit('gameoverforyou');
});
  socket.on('disconnect', () => {
players = players.filter(i => i != players[socket.playerNumber]);
if (players.length === 1) {
players.pop();
}
    counter--;
if (players.length > 0) {
io.sockets.emit('heretheyaredeleted', players, "all");
}
  });
});
http.listen(3000, () => {
  console.log('listening on *:3000');
});