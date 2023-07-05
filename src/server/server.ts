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


//-------------- Test --------------//
const io = new socketIO.Server(server, {});
const socket_manager = new SocketManager(io);
const connections_manager = ConnectionsManager.Instance;

//-------------- Socket events --------------//
//#todo : move this in a file
SocketManager.listenMessageForLoggedConnections('test', (connectionHandler, data) => {
    console.log('test received : ' + data + ' from ' + connectionHandler.connection_data.user.username);
});


EventsManager.onUserCreated.subscribe((connectionData) => {
    console.log("User created : " + JSON.stringify(connectionData));
});

EventsManager.onUserDeleted.subscribe((userId) => {
    console.log("User deleted : id = " + userId);
});