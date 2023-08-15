import ConnectionManager from "./connection_manager.js";
import ObservableEvent from "../global_types/observable_event.js";
import UserData from "./types/user_data.js";
import RequestOperation from "../global_types/request_operation.js";
import { LoginData, LoginResponseData, SignupData, SignupResponseData, TokenLoginData } from "./types/connection_types.js";

export default class AccountConnectionManager {
    private static instance: AccountConnectionManager;

    private isLogged: Boolean;
    private user_data: UserData;
    private token: string;

    private static isLogging: Boolean = false;
    private static isSigningUp: Boolean = false;
    private static isLoggingOut: Boolean = false;
    private static isDeletingAccount: Boolean = false;

    /**
     * Called when the user logs in and was not logged in before
     */
    public static onUserLogin : ObservableEvent<void> = new ObservableEvent();
    /**
     * Called when the user logs out and was logged in before
     */
    public static onUserLogout : ObservableEvent<void> = new ObservableEvent();

    public static get Instance(): AccountConnectionManager {
        if (AccountConnectionManager.instance == null || AccountConnectionManager.instance == undefined) {
            AccountConnectionManager.instance = new AccountConnectionManager();
        }

        return AccountConnectionManager.instance;
    }

    public static get isLogged(): Boolean {
        return AccountConnectionManager.Instance.isLogged;
    }
    public static get userData(): UserData {
        return AccountConnectionManager.Instance.user_data;
    }

    private static get isMakingOperation(): Boolean {
        return AccountConnectionManager.isLogging
            || AccountConnectionManager.isSigningUp
            || AccountConnectionManager.isLoggingOut
            || AccountConnectionManager.isDeletingAccount;
    }

    constructor(){
        AccountConnectionManager.instance = this;
        this.isLogged = false;
        this.user_data = null;
        this.token = null;

        // Bind receive events
        ConnectionManager.onLogin.subscribe((login_response) => this.receiveLoginResponse(login_response));
        ConnectionManager.onSignup.subscribe((signup_response) => this.receiveSignupResponse(signup_response));
        ConnectionManager.onLogout.subscribe((logout_response) => this.receiveLogoutResponse(logout_response));
        ConnectionManager.onAccountDeleted.subscribe((delete_account_response) => this.receiveDeleteAccountResponse(delete_account_response));
    }

    public static sendLoginRequest(username: string, password: string){
        if (this.isLogged
            || this.isMakingOperation
            || !ConnectionManager.isConnected) return;
        
        const login_data = new LoginData(
            username,
            password
        );

        AccountConnectionManager.isLogging = true;
        ConnectionManager.send('login', login_data);
    }
    public static sendSignupRequest(email: string, username: string, password: string, password_confirm: string){
        if (this.isLogged
            || this.isMakingOperation
            || !ConnectionManager.isConnected) return;
        
        
        const signup_data = new SignupData(
            email,
            username,
            password,
            password_confirm
        );
    
        this.isSigningUp = true;
        ConnectionManager.send('signup', signup_data);
    }
    public static sendLogoutRequest(){
        if (!this.isLogged
            || this.isMakingOperation
            || !ConnectionManager.isConnected) return;
        
        this.isLoggingOut = true;
        this.Instance.disconnect();
        ConnectionManager.send('logout', {});
    }
    public static sendDeleteAccountRequest(id: number, password: string){
        if (!this.isLogged
            || this.isMakingOperation
            || !ConnectionManager.isConnected) return;

        const paquet = {
            id: id,
            password: password
        };

        this.isDeletingAccount = true;
        ConnectionManager.send('delete-account', paquet);
    }
    public static async signupAsGuest() : Promise<boolean> {
        if (this.isLogged
            || this.isMakingOperation
            || !ConnectionManager.isConnected) return;

        this.isSigningUp = true;

        const operation : RequestOperation<any,any> = new RequestOperation(
            'guest-signup',
            'guest-signup-response',
            {}
        );    

        const response = await operation.start();

        if (!response.success) {
            AccountConnectionManager.isSigningUp = false;
            alert(response.messages[0]);
            return false;
        }

        AccountConnectionManager.isSigningUp = false;

        AccountConnectionManager.Instance.connect(
            response.signup_response_data.user_data,
            response.signup_response_data.token
        );

        return response.success;
    }

    /**
     * Check if the given id is the id of the logged user.
     * if the user is not logged, return false.
     * @param id the user id to check
     * @returns if the given id is the id of the logged user.
     */
    public static isClient(id: number): boolean {
        if (!this.isLogged) return false;
        return this.userData.userId === id;
    }

    /*---------- connection and disconnection ----------*/
    private connect(UserData: UserData, token: string){
        if (this.isLogged) return;
        this.user_data = UserData;
        this.token = token;
        this.isLogged = true;
        this.saveTokenInLocalStorage();
        AccountConnectionManager.onUserLogin.notify();
    }
    private disconnect(){
        if (!this.isLogged) return;
        this.user_data = null;
        this.token = null;
        this.isLogged = false;
        this.removeTokenFromLocalStorage();
        AccountConnectionManager.onUserLogout.notify();
        console.log('[+] disconnected from account.');
    }

    /*---------- receive responses ----------*/
    private receiveLoginResponse(login_response: any){
        AccountConnectionManager.isLogging = false;
        if (!login_response.success) return;

        const login_response_data : LoginResponseData = login_response.login_response_data;
        this.connect(login_response_data.user_data, login_response_data.token);
    }
    private receiveSignupResponse(signup_response: any){
        AccountConnectionManager.isSigningUp = false;
        if (!signup_response.success) return;
        
        const signup_response_data : SignupResponseData = signup_response.signup_response_data;
        this.connect(signup_response_data.user_data, signup_response_data.token);
    }
    private receiveLogoutResponse(logout_response: any){
        AccountConnectionManager.isLoggingOut = false;
        if (!logout_response.success) return;

        console.log('[+] logout successfull.');

        this.disconnect();
    }
    private receiveDeleteAccountResponse(delete_account_response: any){
        AccountConnectionManager.isDeletingAccount = false;
        if (!delete_account_response.success) return;

        console.log('[+] account deleted.');

        this.disconnect();
    }

    /*---------- token in localstorage management ----------*/
    public static async tryLoginWithLocalStorage() : Promise<Boolean>{
        if (this.isLogged
            || this.isMakingOperation
            || !ConnectionManager.isConnected) return false;
        
        const local_storage_result = this.Instance.loadTokenFromLocalStorage();
        if (!local_storage_result.success) return false;

        AccountConnectionManager.isLogging = true;
        const operation : RequestOperation<any,any> = new RequestOperation(
            'token_login',
            'token-login-response',
            local_storage_result.credentials
        );

        const response = await operation.start();
        console.log(response);

        AccountConnectionManager.isLogging = false;
        AccountConnectionManager.Instance.connect(
            response.login_response_data.user_data,
            response.login_response_data.token
        );

        return response.success;
    }
    private saveTokenInLocalStorage() : boolean{
        if (!this.isLogged) return false;

        const credentials = {
            username: this.user_data.username,
            token: this.token
        };

        localStorage.setItem('credentials', JSON.stringify(credentials));
        console.log('[+] credentials saved in localstorage.');
        return true;
    }
    private loadTokenFromLocalStorage() : any{
        const founded = localStorage.getItem('credentials');
        if (founded == null || founded == undefined) 
            return {
                success: false,
                messages: ['credentials not found in localstorage']
            };
        
        const founded_credentials = JSON.parse(founded);
        return {
            success: true,
            credentials: founded_credentials
        };
    }
    private removeTokenFromLocalStorage() : void{
        localStorage.removeItem('credentials');
    }
}