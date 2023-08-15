// Ceci est le fichier principal de l'application. Il permet de lancer le serveur.

// Importation des modules
import express from 'express';
import http from 'http';
import * as socketIO from 'socket.io';
import dotenv from 'dotenv';
import EventsManager from './class/event_system/events_manager.js';
import SocketManager from './class/connection/socket_manager.js';
import ConnectionsManager from './class/connection/connections_manager.js';

import { setUpListeningMessages } from './messages/any_message.js';
import { setUpListeningLoggedMessages } from './messages/logged_messages.js';

import { router as main_router, __dirname } from './routes/main_routes.js';
import DatabaseManager from './class/database/database_connection.js';

dotenv.config();

//-------------- Server starting --------------//
const app = express();
const server = http.createServer(app);
const port : number = Number(process.env.LISTEN_PORT);

console.log('[+] Initializing server...');

console.log('[+] connecting to database...');

try {
    DatabaseManager.initialize();
}
catch (error) {
    console.error('[-] Error while connecting to database : ' + error);
    process.exit(1);
}


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

EventsManager.onUserCreated.subscribe((connectionData) => {
    console.log("User created : " + JSON.stringify(connectionData));
});

EventsManager.onUserDeleted.subscribe((userId) => {
    console.log("User deleted : id = " + userId);
});