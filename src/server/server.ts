// Ceci est le fichier principal de l'application. Il permet de lancer le serveur.

// Importation des modules
import express from 'express';
import http from 'http';
import * as socketIO from 'socket.io';
import dotenv from 'dotenv';
import UserProcessor from './class/database/processor/user_processor.js';
import EventsManager from './class/event_system/events_manager.js';
import SocketManager from './class/connection/socket_manager.js';
import ConnectionsManager from './class/connection/connections_manager.js';

import { setUpListeningMessages } from './messages/any_message.js';
import { setUpListeningLoggedMessages } from './messages/logged_messages.js';

import { router as main_router, __dirname } from './routes/main_routes.js';

dotenv.config();

//-------------- Server starting --------------//
const app = express();
const server = http.createServer(app);
const port : number = Number(process.env.LISTEN_PORT);

console.log('[+] strating server...');

app.use('/', main_router);

server.listen(port);
console.log('[+] Server started ! listening on port : ' + port);


//-------------- setup --------------//
const io = new socketIO.Server(server, {});
const socket_manager = new SocketManager(io);
const connections_manager = ConnectionsManager.Instance;

//-------------- Socket events --------------//
setUpListeningMessages();
setUpListeningLoggedMessages();

SocketManager.onConnection.subscribe((socket) => {
    socket.on('lobby-join', (data) => {
        console.log("lobby-join : " + JSON.stringify(data));
    });
});

EventsManager.onUserCreated.subscribe((connectionData) => {
    console.log("User created : " + JSON.stringify(connectionData));
});

EventsManager.onUserDeleted.subscribe((userId) => {
    console.log("User deleted : id = " + userId);
});