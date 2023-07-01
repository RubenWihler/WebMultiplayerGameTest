// Ceci est le fichier principal de l'application. Il permet de lancer le serveur.

// Importation des modules
// var express = require('express');
import express from 'express';
import http from 'http';
import * as socketIO from 'socket.io';
import path from 'path';
import UserProcessor from './server/database/processor/user_processor.js';
import EventsManager from './server/class/events_manager.js';

const PORT = 2000;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/dist/client'));

server.listen(PORT);
console.log('[+] Server started.');

console.log('[+] Test');


var SOCKET_LIST = {};

const io = new socketIO.Server(server, {});
io.sockets.on('connection', function (socket:any) {
    socket.id = Math.random();
    socket.name = "P-" + Math.floor(Math.random() * 10);
    socket.position = {
        x: 0,
        y: 0
    };
    SOCKET_LIST[socket.id] = socket;
    
    console.log('socket connection');

    socket.on('disconnect', function () {
        console.log('socket disconnection');
        delete SOCKET_LIST[socket.id];
    });
});

setInterval(function () {
    var pack = [];

    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.position.x++;
        socket.position.y++;
        pack.push({
            position: socket.position,
            name: socket.name
        });
    }

    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('update', pack);
    }   

}, 1000 / 25);