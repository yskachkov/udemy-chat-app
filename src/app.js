const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
  socket.on('join', ({ username, room }, callback) => {
    if (!username || !room) {
      callback('Please log in first.');
      return;
    }

    const { error } = addUser({
      username,
      room,
      id: socket.id,
    });

    if (error) {
      callback(error);
      return;
    }

    socket.join(room);
    socket.emit('message', generateMessage('Admin','Welcome.'));
    socket
      .broadcast
      .to(room)
      .emit(
        'message',
        generateMessage('Admin', `${username} has joined.`)
      );
    io.to(room).emit('roomData', {
      room,
      users: getUsersInRoom(room)
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      callback('Profanity is not allowed.');
      return;
    }

    const { username, room } = getUser(socket.id);

    io.to(room).emit('message', generateMessage(username, message));
    callback();
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const { username, room } = getUser(socket.id);

    io.to(room).emit(
      'locationMessage',
      generateLocationMessage(
        username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      const { username, room } = user;

      io.to(room).emit('message', generateMessage('Admin', `${username} has left.`));
      io.to(room).emit('roomData', {
        room,
        users: getUsersInRoom(room)
      });
    }
  });
});

module.exports = server;
