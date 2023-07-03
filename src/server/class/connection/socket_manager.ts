import * as socketIO from 'socket.io';
import UserProcessor from '../database/processor/user_processor.js';
import ConnectionHandler from './connection_handler.js';
import ConnectionsManager from './connections_manager.js';

export default class SocketManager {
    private static instance: SocketManager;
    private io: socketIO.Server;

    private connected_sockets: Map<string, ConnectionHandler>;
    private not_connected_sockets: socketIO.Socket[];


    public static get Instance(): SocketManager {
        if (SocketManager.instance == null || SocketManager.instance == undefined) {
            throw new Error('SocketManager not initialized !');
        }

        return SocketManager.instance;
    }

    public static get Io(): socketIO.Server {
        return this.Instance.io;
    }

    public static get ConnectedSockets(): Map<string, ConnectionHandler> {
        return this.Instance.connected_sockets;
    }

    constructor(io: socketIO.Server) {
        SocketManager.instance = this;
        this.not_connected_sockets = [];
        this.connected_sockets = new Map();
        this.io = io;
        io.on('connection', (socket) => this.onConnection(socket));
    }

    private onConnection(socket: socketIO.Socket){
        this.not_connected_sockets.push(socket);
        this.bindMessages(socket);
        console.log('[+] New socket connected : ' + socket.id);
        this.printTest();
    }

    private bindMessages(socket: socketIO.Socket){
        socket.on('disconnect', () => this.onDisconnect(socket));
        socket.on('login', (login_data) => this.onLogin(socket, login_data));
    }


    private onDisconnect(socket: socketIO.Socket){
        if(this.not_connected_sockets.find((s) => s.id == socket.id) != null){
            this.not_connected_sockets.splice(this.not_connected_sockets.indexOf(socket), 1);
            console.log('[+] not-connected-socket disconnected : ' + socket.id);
            this.printTest();
            return;
        }
        
        const connection_handler = this.connected_sockets.get(socket.id);
        connection_handler.socket = null;
        connection_handler.disconnect();
        this.connected_sockets.delete(socket.id);

        console.log('[+] connected-socket disconnected : ' + socket.id);
        this.printTest();
    }
    private async onLogin(socket: socketIO.Socket, login_data: any){

        //If the socket is already associated with a connection
        if(this.connected_sockets.get(socket.id) != null){
            socket.emit('login-response', {
                success: false,
                messages: ['You are already connected to an account !']
            });
            return;
        }
        
        const login_response = await UserProcessor.signInAsync(login_data.username, login_data.password);
        
        // If the login is not successful
        if (!login_response.statut){
            socket.emit('login-response', {
                success: false,
                messages: login_response.msg
            });
            return;
        }

        // If the login is successful
        const connection_handler = new ConnectionHandler();
        connection_handler.connect(login_response.connection_data, socket);
        
        this.not_connected_sockets.splice(this.not_connected_sockets.indexOf(socket), 1);
        this.connected_sockets.set(socket.id, connection_handler);
        connection_handler.socket = socket;

        socket.emit('login-response', {success: true});
        console.log('[+] User connected: ');
        console.log('  user id: ' + connection_handler.connection_data.user.userId);
        console.log('  username: ' + connection_handler.connection_data.user.username);
        console.log('  email: ' + connection_handler.connection_data.user.email);
        console.log('  token: ' + connection_handler.connection_data.token);
        console.log('  socket id: ' + socket.id);
    }

    private printTest(){
        console.log('');
        console.log('');
        console.log('[+] connected users: ');
        this.connected_sockets.forEach((connection_handler, id) => {
            console.log('  ' + id);
        });
        console.log('');
        console.log('[+] not connected users: ');
        this.not_connected_sockets.forEach((socket) => {
            console.log('  ' + socket.id);
        });
        console.log('');
        console.log('');
        console.log('[+] current connection: ');
        ConnectionsManager.CurrentConnections.forEach((connection_handler) => {
            console.log('  ' + connection_handler.connection_data.user.userId + ' : ' + connection_handler.socket.id);
        });
    }
}