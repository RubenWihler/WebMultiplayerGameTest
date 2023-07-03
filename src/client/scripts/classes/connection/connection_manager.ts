declare var io: any;
declare var Socket: any;
// import { io, Socket } from 'socket.io-client';
import ObservableEvent from './types/observable_event.js';

export default class ConnectionManager {
    private static instance: ConnectionManager;
    
    // @ts-expect-error
    public socket : Socket;

    public static onConnect : ObservableEvent<void> = new ObservableEvent();
    public static onDisconnect : ObservableEvent<void> = new ObservableEvent();
    public static onLoginResponse : ObservableEvent<any> = new ObservableEvent();


    public static get Instance(): ConnectionManager {
        if (ConnectionManager.instance == null || ConnectionManager.instance == undefined) {
            ConnectionManager.instance = new ConnectionManager();
        }

        return ConnectionManager.instance;
    }
    
    public static get isConnected(): Boolean {
        return ConnectionManager.Instance.socket.connected;
    }

    constructor() {
        ConnectionManager.instance = this;
        this.socket = io();
        this.socket.on('connect', () => this.onReceiveConnect());
    }

    public static send(message: string, data: any){
        ConnectionManager.Instance.socket.emit(message, data);
    }

    private onReceiveConnect(){
        console.log('[+] New socket connected');
        ConnectionManager.onConnect.notify();
        this.bindMessages();
    }

    private bindMessages(){
        this.socket.on('disconnect',this.onReceiveDisconnect);
        this.socket.on('login-response', this.onReceiveLoginResponse);
    }

    private onReceiveDisconnect(){
        console.log('[-] Socket disconnected');
        ConnectionManager.onDisconnect.notify();

    }
    private onReceiveLoginResponse(login_response: any){
        ConnectionManager.onLoginResponse.notify(login_response);

    }    

}