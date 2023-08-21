declare var io: any;
declare var Socket: any;
import ObservableEvent from '../global_types/observable_event.js';

export default class ConnectionManager {
    private static instance: ConnectionManager;

    // @ts-expect-error
    public socket : Socket;

    public static onConnect : ObservableEvent<void> = new ObservableEvent();
    public static onDisconnect : ObservableEvent<void> = new ObservableEvent();
    public static onLogin : ObservableEvent<any> = new ObservableEvent();
    public static onTokenLogin : ObservableEvent<any> = new ObservableEvent();
    public static onSignup : ObservableEvent<any> = new ObservableEvent();
    public static onLogout : ObservableEvent<any> = new ObservableEvent();
    public static onAccountDeleted : ObservableEvent<any> = new ObservableEvent();
    public static onConnectionError : ObservableEvent<any> = new ObservableEvent();


    public static get Instance(): ConnectionManager {
        if (ConnectionManager.instance == null || ConnectionManager.instance == undefined) {
            ConnectionManager.instance = new ConnectionManager();
        }

        return ConnectionManager.instance;
    }
    
    /**
     * Returns true if the socket is connected
     */
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
    public static on(message: string, callback: Function){
        ConnectionManager.Instance.socket.on(message, callback);
    }
    public static off(message: string, callback: Function = null){
        if (callback != null){
            ConnectionManager.Instance.socket.removeListener(message, callback);
            return;
        }

        ConnectionManager.Instance.socket.removeAllListeners(message);
    }

    private bindMessages(){
        this.socket.on('disconnect', () => this.onReceiveDisconnect());
        this.socket.on('login-response', (login_response) => this.onReceiveLoginResponse(login_response));
        this.socket.on('token-login-response', (login_response) => this.onReceiveTokenLoginResponse(login_response));
        this.socket.on('signup-response', (signup_response) => this.onReceiveSignupResponse(signup_response));
        this.socket.on('logout-response', (logout_response) => this.onReceiveLogoutResponse(logout_response));
        this.socket.on('delete-account-response', (data) => this.onReceiveAccountDeleted(data));
        this.socket.on('connection-error', (data) => this.onReceivConnectionError(data));
    }
    
    private onReceiveConnect(){
        console.log(`[+] Socket connected: ${this.socket.id}`);
        ConnectionManager.onConnect.notify();
        this.bindMessages();
    }
    private onReceiveDisconnect(){
        console.warn('[!] Socket disconnected');
        ConnectionManager.onDisconnect.notify();
    }
    private onReceiveLoginResponse(login_response: any){
        ConnectionManager.onLogin.notify(login_response);
    }
    private onReceiveTokenLoginResponse(login_response: any){
        ConnectionManager.onTokenLogin.notify(login_response);
    }
    private onReceiveSignupResponse(signup_response: any){
        ConnectionManager.onSignup.notify(signup_response);
    }
    private onReceiveLogoutResponse(logout_response: any){
        ConnectionManager.onLogout.notify(logout_response);
    }
    private onReceivConnectionError(data: any){
        ConnectionManager.onConnectionError.notify(data);
    }
    private onReceiveAccountDeleted(data: any){
        ConnectionManager.onAccountDeleted.notify(data);
    }

}