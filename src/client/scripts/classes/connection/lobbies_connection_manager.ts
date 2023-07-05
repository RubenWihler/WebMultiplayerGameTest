import ConnectionManager from "./connection_manager.js";
import ObservableEvent from "../global_types/observable_event.js";
import UserData from "./types/user_data.js";
import { LobbyData } from "./types/lobbies_types.js";
import RequestOperation from "../global_types/request_operation.js";

export default class LobbiesConnectionManager{
    private static _instance: LobbiesConnectionManager;

    private _joining_lobby: boolean = false;
    private _creating_lobby: boolean = false;
    private _leaving_lobby: boolean = false;

    private _currentLobbyData: LobbyData;

    public readonly onLobbyJoined: ObservableEvent<LobbyData> = new ObservableEvent<LobbyData>();
    public readonly onLobbyLeft: ObservableEvent<void> = new ObservableEvent<void>();


    public static get instance(): LobbiesConnectionManager {
        if (LobbiesConnectionManager._instance == null || LobbiesConnectionManager._instance == undefined) {
            LobbiesConnectionManager._instance = new LobbiesConnectionManager();
        }

        return LobbiesConnectionManager._instance;
    }

    public static get currentLobbyData(): LobbyData {
        return LobbiesConnectionManager.instance._currentLobbyData;
    }

    public get inLobby(): boolean{
        return this._currentLobbyData != null;
    }

    public get isMakingOperation(): boolean{
        return this._joining_lobby || this._creating_lobby || this._leaving_lobby;
    }

    constructor(){
        LobbiesConnectionManager._instance = this;
        this._currentLobbyData = null;

        this.bindLobbyMessages();
    }

    public static async createLobby(lobby_name: string, lobby_password: string, max_players: number): Promise<any>{
        const inst = LobbiesConnectionManager.instance;
        const errors = [];

        // Check if already making an operation on a lobby
        if (inst.isMakingOperation){
            return {
                success: false,
                messages: ["Already making an operation on a lobby"]
            };
        }

        // Check if connected to server. If not connected, return error
        if (!ConnectionManager.isConnected){
            return {
                success: false,
                messages: ["Not connected to server"]
            }
        }

        // Check if the user in not already in a lobby
        if (inst.inLobby){
            return {
                success: false,
                messages: ["Already in a lobby"]
            }
        }

        if (lobby_name == null || lobby_name == undefined || lobby_name == ""){
            errors.push("A lobby name must be specified");
        }
        if (max_players == null || max_players == undefined || max_players <= 0){
            errors.push("A lobby must have at least 2 player");
        }

        // Check if there are errors
        if (errors.length > 0){
            return {
                success: false,
                messages: errors
            }
        }

        const paquet = {
            lobby_name: lobby_name,
            lobby_password: lobby_password,
            max_players: max_players
        };

        inst._creating_lobby = true;

        //create the operation
        const operation = new RequestOperation("lobby-create", "lobby-create-response", paquet);
        const result : any = await operation.start();

        inst._creating_lobby = false;

        // Check if the operation was successful
        if (result == null){
            return {
                success: false,
                messages: ["Server error"]
            }
        }

        // Check if the operation was successful
        if (!result.success){
            return {
                success: false,
                messages: result.messages
            }
        }

        return {
            success: true,
            lobby_id: result.lobby_id
        };
    }
    public static async joinLobby(lobby_id: string, lobby_password: string|null): Promise<any>{
        const inst = LobbiesConnectionManager.instance;
        const errors = [];

        // Check if already making an operation on a lobby
        if (inst.isMakingOperation){
            return {
                success: false,
                messages: ["Already making an operation on a lobby"]
            };
        }

        // Check if connected to server. If not connected, return error
        if (!ConnectionManager.isConnected){
            return {
                success: false,
                messages: ["Not connected to server"]
            }
        }

        // Check if the user in not already in a lobby
        if (inst.inLobby){
            return {
                success: false,
                messages: ["Already in a lobby"]
            }
        }


        if (lobby_id == null || lobby_id == undefined || lobby_id == ""){
            errors.push("A lobby id must be specified");
        }

        // Check if there are errors
        if (errors.length > 0){
            return {
                success: false,
                messages: errors
            }
        }

        const paquet = {
            lobby_id: lobby_id,
            lobby_password: lobby_password
        };

        inst._joining_lobby = true;

        //create the operation
        const operation = new RequestOperation<any, any>("lobby-join", "lobby-join-response", paquet);
        const result : any = await operation.start();

        inst._joining_lobby = false;

        // Check if the operation was successful
        if (result == null){
            return {
                success: false,
                messages: ["Server error"]
            }
        }

        // Check if the operation was successful
        if (!result.success){
            return {
                success: false,
                messages: result.messages
            }
        }

        return {
            success: true
        }
    }
    public static async getLobbiesList(): Promise<any>{
        const inst = LobbiesConnectionManager.instance;
        
        // Check if connected to server. If not connected, return error
        if (!ConnectionManager.isConnected){
            return {
                success: false,
                messages: ["Not connected to server"]
            };
        }

        const operation = new RequestOperation<any, any>("lobby-list", "lobby-list-response", {});
        const result : any = await operation.start();

        // Check if the operation was successful
        if (result == null){
            return {
                success: false,
                messages: ["Server error"]
            };
        }

        // Check if the operation was successful
        if (!result.success){
            return {
                success: false,
                messages: result.messages
            };
        }

        return {
            success: true,
            lobbies: result.lobbies
        };
    }
    public static async leaveLobby(): Promise<any>{
        // Check if already making an operation on a lobby
        if (LobbiesConnectionManager.instance.isMakingOperation){
            return {
                success: false,
                messages: ["Already making an operation on a lobby"]
            };
        }

        // Check if connected to server. If not connected, return error
        if (!ConnectionManager.isConnected){
            return {
                success: false,
                messages: ["Not connected to server"]
            };
        }

        // Check if the user in a lobby
        if (!LobbiesConnectionManager.instance.inLobby){
            return {
                success: false,
                messages: ["Not in a lobby"]
            };
        }

        LobbiesConnectionManager._instance._leaving_lobby = true;

        const operation = new RequestOperation<any, any>("lobby-leave", "lobby-leave-response", {});
        const result : any = await operation.start();

        LobbiesConnectionManager._instance._leaving_lobby = false;

        // Check if the operation was successful
        if (result == null){
            return {
                success: false,
                messages: ["Server error"]
            };
        }

        // Check if the operation was successful
        if (!result.success){
            return {
                success: false,
                messages: result.messages
            };
        }

        return {
            success: true
        };
    }

    private onLobbyJoin(data: any){
        this._currentLobbyData = new LobbyData(
            data.id,
            data.name,
            data.using_password,
            data.max_players,
            data.owner_id,
            data.users
        );

        this.onLobbyJoined.notify(this._currentLobbyData);
        console.log(`[+] joined lobby : ${this._currentLobbyData.name} data : ` + JSON.stringify(this._currentLobbyData));
    }
    private onLobbyLeave(){
        this._currentLobbyData = null;
        this.onLobbyLeft.notify();
        console.log('[+] Left lobby with success.');

    }

    private bindLobbyMessages(){
        const inst = LobbiesConnectionManager.instance;

        // Join a lobby
        ConnectionManager.Instance.socket.on('lobby-joined', (data) => {
            if (!data.success){
                console.log(`[!] failed to join lobby : ${data.messages}`);
                return;
            }

            inst.onLobbyJoin(data.lobby_data);
        });

        // Leave a lobby
        ConnectionManager.Instance.socket.on('lobby-left', (data) => {
            if (!data.success){
                console.log(`[!] failed to leave lobby : ${data.messages}`);
                return;
            }

            inst.onLobbyLeave();
            console.log(`[+] left lobby`);
        });
    }
}