import * as socketIO from 'socket.io';
import UserProcessor from '../database/processor/user_processor.js';
import ConnectionHandler from './connection_handler.js';
import ConnectionsManager from './connections_manager.js';
import { json } from 'express';

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
    }

    private bindMessages(socket: socketIO.Socket){
        socket.on('disconnect', () => this.onDisconnect(socket));
        socket.on('signup', (signup_data) => this.onSignup(socket, signup_data));
        socket.on('login', (login_data) => this.onLogin(socket, login_data));
        socket.on('token_login', (token_login_data) => this.onTokenLogin(socket, token_login_data));
        socket.on('logout', () => this.onLogout(socket));
    }


    private onDisconnect(socket: socketIO.Socket){
        //When the socket is not associated with a connection
        if(this.not_connected_sockets.find((s) => s.id == socket.id) != null){
            this.not_connected_sockets.splice(this.not_connected_sockets.indexOf(socket), 1);
            console.log('[+] not-connected-socket disconnected : ' + socket.id);
            return;
        }
        
        //When the socket is associated with a connection
        const connection_handler = this.connected_sockets.get(socket.id);
        connection_handler.socket = null;
        connection_handler.disconnect();
        this.connected_sockets.delete(socket.id);

        console.log('[+] connected-socket disconnected : ' + socket.id);
    }
    private async onSignup(socket: socketIO.Socket, signup_data: any){
        
        //If the socket is already associated with a connection
        if(this.isSocketAlreadyConnected(socket)){
            socket.emit('signup-response', {
                success: false,
                messages: ['You are already connected to an account ! please disconnect first.']
            });
            return;
        }

        //pre-check validity of the signup data
        const errormsgs = [];
        if (signup_data.username == null || signup_data.username == undefined || signup_data.username == ''){
            errormsgs.push('username is required !');
        }
        if (signup_data.email == null || signup_data.email == undefined || signup_data.email == ''){
            errormsgs.push('email is required !');
        }
        if (signup_data.password == null || signup_data.password == undefined || signup_data.password == ''){
            errormsgs.push('password is required !');
        }
        if (signup_data.password_confirm !== signup_data.password){
            errormsgs.push('password confirmation does not match !');
        }

        //If there is an error
        if (errormsgs.length > 0){
            socket.emit('signup-response', {
                success: false,
                messages: errormsgs
            });

            return;
        }

        const signup_response = await UserProcessor.createUserAsync(signup_data.username, signup_data.email, signup_data.password);
        
        // If the signup is not successful
        if (!signup_response.statut){
            socket.emit('signup-response', {
                success: false,
                messages: signup_response.msg
            });
            return;
        }

        // The signup is successful
        // login the user
        const login_data = {
            username: signup_data.username,
            password: signup_data.password
        }

        const login_response = await UserProcessor.signInAsync(login_data.username, login_data.password);
        
        if (!login_response.statut){
            socket.emit('signup-response', {
                success: false,
                messages: ['Your account has been created successfully but an error occured while trying to login you. Please try to login manually.']
            });
            return;
        }

        // The login is successful
        const connection_handler = new ConnectionHandler();
        connection_handler.connect(login_response.connection_data, socket);
        
        this.not_connected_sockets.splice(this.not_connected_sockets.indexOf(socket), 1);
        this.connected_sockets.set(socket.id, connection_handler);
        connection_handler.socket = socket;
        
        
        const response = {
            success: true,
            messages: ['Your account has been created successfully ! You are now logged in.'],
            signup_response_data: {
                user_data: {
                    userId: login_response.connection_data.user.user_id,
                    username: login_response.connection_data.user.username,
                    email: login_response.connection_data.user.email
                },
                token: login_response.connection_data.token
            }
        }
        socket.emit('signup-response', response);
    }
    private async onLogin(socket: socketIO.Socket, login_data: any){

        //If the socket is already associated with a connection
        if(this.isSocketAlreadyConnected(socket)){
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

        socket.emit('login-response', {
            success: true,
            messages: ['Connected successfully !'],
            login_response_data: {
                user_data: {
                    userId: login_response.connection_data.user.user_id,
                    username: login_response.connection_data.user.username,
                    email: login_response.connection_data.user.email
                },
                token: login_response.connection_data.token
            }
        });
    }
    private async onLogout(socket: socketIO.Socket){
        if(!this.isSocketAlreadyConnected(socket)){
            socket.emit('logout-response', {
                success: false,
                messages: ['You are not connected to an account !']
            });
        }
    
        const connection_handler = this.connected_sockets.get(socket.id);
        connection_handler.disconnect();
        socket.emit('logout-response', {success: true});
        return;
    }
    private async onTokenLogin(socket: socketIO.Socket, credentials: any){
        //If the socket is already associated with a connection
        if(this.isSocketAlreadyConnected(socket)){
            socket.emit('token-login-response', {
                success: false,
                messages: ['You are already connected to an account !']
            });
            return;
        }

        const login_response = await UserProcessor.signinWithTokenAsync(credentials.username, credentials.token);

        // If the login is not successful
        if (!login_response.statut){
            socket.emit('token-login-response', {
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

        socket.emit('token-login-response', {
            success: true,
            messages: ['Connected successfully !'],
            login_response_data: {
                user_data: {
                    userId: login_response.connection_data.user.userId,
                    username: login_response.connection_data.user.username,
                    email: login_response.connection_data.user.email
                },
                token: login_response.connection_data.token
            }
        });

    }

    /**
     * return true if the socket is already connected to an account.
     * @param socket the socket to check
     * @returns true if the socket is already connected to an account.
     */
    private isSocketAlreadyConnected(socket: socketIO.Socket): Boolean{
        return this.connected_sockets.get(socket.id) != null;
    }
    // private printTest(){
    //     console.log('');
    //     console.log('');
    //     console.log('[+] connected users: ');
    //     this.connected_sockets.forEach((connection_handler, id) => {
    //         console.log('  ' + id);
    //     });
    //     console.log('');
    //     console.log('[+] not connected users: ');
    //     this.not_connected_sockets.forEach((socket) => {
    //         console.log('  ' + socket.id);
    //     });
    //     console.log('');
    //     console.log('');
    //     console.log('[+] current connection: ');
    //     ConnectionsManager.CurrentConnections.forEach((connection_handler) => {
    //         console.log('  ' + connection_handler.connection_data.user.userId + ' : ' + connection_handler.socket.id);
    //     });
    // }
}