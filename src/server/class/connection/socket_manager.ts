import { Socket, Server } from 'socket.io';
import UserProcessor from '../database/processor/user_processor.js';
import ConnectionHandler from './connection_handler.js';
import ConnectionsManager from './connections_manager.js';
import ObservableEvent from '../event_system/observable_event.js';
import { json } from 'express';

export default class SocketManager {
    private static instance: SocketManager;
    private io: Server;

    private connected_sockets: Map<string, ConnectionHandler>;
    private not_connected_sockets: Socket[];

    public static readonly onConnection: ObservableEvent<Socket> = new ObservableEvent();
    public static readonly onDisconnection: ObservableEvent<Socket> = new ObservableEvent();
    private static readonly listeningMessages: Map<string, Set<(socket: Socket, data) => void>> = new Map();
    public static readonly listeningMessagesForLoggedConnections: Map<string, Set<(connecitonHandler: ConnectionHandler, data: any) => void>> = new Map();

    public static get Instance(): SocketManager {
        if (SocketManager.instance == null || SocketManager.instance == undefined) {
            throw new Error('SocketManager not initialized !');
        }

        return SocketManager.instance;
    }

    public static get Io(): Server {
        return this.Instance.io;
    }

    public static get ConnectedSockets(): Map<string, ConnectionHandler> {
        return this.Instance.connected_sockets;
    }

    constructor(io: Server) {
        SocketManager.instance = this;
        this.not_connected_sockets = [];
        this.connected_sockets = new Map();
        this.io = io;
        io.on('connection', (socket) => this.onConnection(socket));
    }

    public static listenMessage(message: string, callback: (socket: Socket, data: any) => void){
        if (!SocketManager.listeningMessages.has(message)) {
            const callbacks = new Set<(socket: Socket, data) => void>();
            callbacks.add(callback);
            SocketManager.listeningMessages.set(message, callbacks);
            console.log('[+] New message listened : ' + message);
            return;
        }

        SocketManager.listeningMessages.get(message).add(callback);
        console.log('[+] New callback added to message : ' + message);
    }
    public static listenMessageForLoggedConnections(message: string, callback: (connection: ConnectionHandler, data: any) => void){
        if (!SocketManager.listeningMessagesForLoggedConnections.has(message)) {
            const callbacks = new Set<(connection: ConnectionHandler, data) => void>();
            callbacks.add((connection: ConnectionHandler, data: any) => {
                console.log('[+] logged message triggered : ' + message + ' for ' + connection.connection_data.user.username);
            });
            callbacks.add(callback);

            SocketManager.listeningMessagesForLoggedConnections.set(message, callbacks);
            console.log('[+] New message listened for logged connections : ' + message);
            return;
        }
        
        SocketManager.listeningMessagesForLoggedConnections.get(message).add(callback);
        console.log('[+] New callback added to message for logged connections : ' + message);
    }

    private onConnection(socket: Socket){
        this.not_connected_sockets.push(socket);
        this.bindMessages(socket);
        console.log('[+] New socket connected : ' + socket.id);
    }

    private bindMessages(socket: Socket){

        //Bind all messages
        for(const [message, callbacks] of SocketManager.listeningMessages.entries()){
            callbacks.forEach((callback) => {
                socket.on(message, (data) => {
                    callback(socket, data);
                });
            });
        }

        socket.on('test', (data) => {});
        socket.on('disconnect', () => this.onDisconnect(socket));
        socket.on('signup', (signup_data) => this.onSignup(socket, signup_data));
        socket.on('login', (login_data) => this.onLogin(socket, login_data));
        socket.on('token_login', (token_login_data) => this.onTokenLogin(socket, token_login_data));
        socket.on('logout', () => this.onLogout(socket));
        socket.on('delete-account', (credentials) => this.onDeleteAccount(socket, credentials));
    }

    private onDisconnect(socket: Socket){
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
    private async onSignup(socket: Socket, signup_data: any){
        
        //If the socket is already associated with a connection
        if(this.isSocketAlreadyConnected(socket)){
            socket.emit('signup-response', {
                success: false,
                messages: ['USER_ALREADY_LOGGED_IN']
            });
            return;
        }

        //pre-check validity of the signup data
        const errormsgs = [];
        if (signup_data.username == null || signup_data.username == undefined || signup_data.username == ''){
            errormsgs.push('USERNAME_REQUIRED');
        }
        if (signup_data.email == null || signup_data.email == undefined || signup_data.email == ''){
            errormsgs.push('EMAIL_REQUIRED');
        }
        if (signup_data.password == null || signup_data.password == undefined || signup_data.password == ''){
            errormsgs.push('PASSWORD_REQUIRED');
        }
        if (signup_data.password_confirm == null || signup_data.password_confirm == undefined || signup_data.password_confirm == ''){
            errormsgs.push('PASSWORD_CONFIRM_REQUIRED');
        }
        if (signup_data.password_confirm !== signup_data.password){
            errormsgs.push('PASSWORDS_DO_NOT_MATCH');
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
                    userId: login_response.connection_data.user.userId,
                    username: login_response.connection_data.user.username,
                    email: login_response.connection_data.user.email
                },
                token: login_response.connection_data.token
            }
        }
        socket.emit('signup-response', response);
    }
    private async onLogin(socket: Socket, login_data: any){

        //If the socket is already associated with a connection
        if(this.isSocketAlreadyConnected(socket)){
            socket.emit('login-response', {
                success: false,
                messages: ['USER_ALREADY_LOGGED_IN']
            });
            return;
        }

        //pre-check validity of the login data
        const errormsgs = [];

        console.log(JSON.stringify(login_data));

        if (login_data.username == null || login_data.username == undefined || login_data.username.length === 0){
            errormsgs.push('USERNAME_REQUIRED');
        }
        if (login_data.password == null || login_data.password == undefined || login_data.password.length === 0){
            errormsgs.push('PASSWORD_REQUIRED');
        }

        //If there is an error
        if (errormsgs.length > 0){
            socket.emit('login-response', {
                success: false,
                messages: errormsgs
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
                    userId: login_response.connection_data.user.userId,
                    username: login_response.connection_data.user.username,
                    email: login_response.connection_data.user.email
                },
                token: login_response.connection_data.token
            }
        });
    }
    private async onLogout(socket: Socket){
        if(!this.isSocketAlreadyConnected(socket)){
            socket.emit('logout-response', {
                success: false,
                messages: ['USER_NOT_LOGGED_IN']
            });
        }
    
        const connection_handler = this.connected_sockets.get(socket.id);
        connection_handler.disconnect();
        socket.emit('logout-response', {success: true});
        return;
    }
    private async onTokenLogin(socket: Socket, credentials: any){
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
    private async onDeleteAccount(socket: Socket, credentials: any){
        //credentials = {id, password}

        if(!this.isSocketAlreadyConnected(socket)){
            socket.emit('logout-response', {
                success: false,
                messages: ['USER_NOT_LOGGED_IN']
            });

            return;
        }

        //check if the credentials are valid
        const errormsgs = [];

        if (credentials.id == null || credentials.id == undefined){
            errormsgs.push('ID_REQUIRED');
        }
        if (credentials.password == null || credentials.password == undefined || credentials.password.length === 0){
            errormsgs.push('PASSWORD_REQUIRED');
        }

        //If there is an error
        if (errormsgs.length > 0){
            socket.emit('delete-account-response', {
                success: false,
                messages: errormsgs
            });

            return;
        }

        //disconnect the user
        const connection_handler = this.connected_sockets.get(socket.id);

        //delete the account
        const delete_response = await UserProcessor.deleteUserAsync(credentials.id, credentials.password);

        if(!delete_response.statut){
            socket.emit('delete-account-response', {
                success: false,
                messages: [delete_response.msg]
            });
            return;
        }

        socket.emit('delete-account-response', {
            success: true
        });

        connection_handler.disconnect();
    }

    /**
     * return true if the socket is already connected to an account.
     * @param socket the socket to check
     * @returns true if the socket is already connected to an account.
     */
    private isSocketAlreadyConnected(socket: Socket): Boolean{
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