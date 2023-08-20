import ConnectionHandler, { ConnectionStatus } from "../connection/connection_handler.js";
import ObservableEvent from "../event_system/observable_event.js";
import BanWord from "../global_types/ban_word.js";
import LobbiesManager from "./lobbies_manager.js";
import Messages from "../connection/messages.js";
import GameManager from "../game/game_manager.js";
import GameSettings from "../game/game_settings.js";
import GameMap from "../game/map/map.js";
import EngineConfig from "../game/server_game_engine/engine_config.js";
import Game from "../game/game.js";
import Size from "../game/server_game_engine/types/size.js";

type LobbySetting = {
    id: string, 
    name: string, 
    using_password: boolean, 
    password: string, 
    max_players: number, 
    owner_id: number,
    game_player_count: number,
    game_player_size: Size,
    game_player_speed: number,
    game_ball_size: Size,
    game_ball_speed: number,
    game_player_life: number
}

export default class Lobby {
    public static readonly MIN_LOBBY_PLAYERS = 2;
    public static readonly MAX_LOBBY_PLAYERS = 8;

    private readonly _id: string;
    private readonly _connections: Map<number, ConnectionHandler>;
    private _password: string;
    private _max_players: number;
    private _name: string;
    private _owner_id: number;
    private _banned_user_ids: Set<number>;

    private _game: Game = null;

    //game settings
    private _game_player_count: number;
    private _game_player_size: Size;
    private _game_player_speed: number;
    private _game_ball_size: Size;
    private _game_ball_speed: number;
    private _game_player_life: number;

    public readonly onConnectionAdd: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    public readonly onConnectionRemove: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    public readonly onNameChange: ObservableEvent<string> = new ObservableEvent();
    public readonly onPasswordChange: ObservableEvent<string> = new ObservableEvent();
    public readonly onMaxPlayersChange: ObservableEvent<number> = new ObservableEvent();
    public readonly onOwnerChange: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    public readonly onGamePlayerCountChange: ObservableEvent<number> = new ObservableEvent();
    public readonly onGamePlayerSizeChange: ObservableEvent<Size> = new ObservableEvent();
    public readonly onGamePlayerSpeedChange: ObservableEvent<number> = new ObservableEvent();
    public readonly onGameBallSizeChange: ObservableEvent<Size> = new ObservableEvent();
    public readonly onGameBallSpeedChange: ObservableEvent<number> = new ObservableEvent();
    public readonly onGamePlayerLifeChange: ObservableEvent<number> = new ObservableEvent();
    public readonly onUserBan: ObservableEvent<number> = new ObservableEvent();
    public readonly onUserUnBan: ObservableEvent<number> = new ObservableEvent();
    public readonly onUserKick: ObservableEvent<number> = new ObservableEvent();
    public readonly onUserStatusChange: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    /**
     * Called when a user disconnect (socket disconnected or leave) from the lobby.
     */
    public readonly onUserDisconnect: ObservableEvent<ConnectionHandler> = new ObservableEvent();

    constructor(id: string, name: string, password: string = null) {
        this._id = id;
        this._name = name;
        this._owner_id = null;
        this._banned_user_ids = new Set<number>();
        this._connections = new Map<number, ConnectionHandler>();
        this._password = password;

        //set default game settings
        this._game_player_count = EngineConfig.DEFAULT_PLAYER_COUNT;
        this._game_player_size = EngineConfig.DEFAULT_PLAYER_SIZE;
        this._game_player_speed = EngineConfig.DEFAULT_PLAYER_SPEED;
        this._game_ball_size = EngineConfig.DEFAULT_BALL_SIZE;
        this._game_ball_speed = EngineConfig.DEFAULT_BALL_SPEED;
        this._game_player_life = EngineConfig.DEFAULT_PLAYER_LIFE;
    }

    /**
     * Return the unique id of the lobby.
     */
    public get id(): string {
        return this._id;
    }
    /**
     * Returns the name of the lobby.
     */
    public get name(): string {
        return this._name;
    }
    /**
     * Returns the password of the lobby.
     * If the lobby has no password, returns null.
     */
    public get password(): string {
        return this._password;
    }
    /**
     * Returns true if the lobby has a password. False otherwise.
     */
    public get using_password(): boolean {
        return this._password !== null;
    }
    /**
     * returns all the connections in the lobby.
     * @see connectionsMap
     */
    public get connections(): ConnectionHandler[] {
        return Array.from(this._connections.values());
    }
    /**
     * Returns all the connections in the lobby as a map. 
     * The key is the user id of the connection and the value is the connection.
     * @see connections
     */
    public get connectionsMap(): Map<number, ConnectionHandler> {
        return this._connections;
    }
    /**
     * Returns the number of connections in the lobby.
     */
    public get player_count(): number {
        return this._connections.size;
    }
    /**
     * Returns the maximum number of players in the lobby.
     */
    public get max_players(): number {
        return this._max_players;
    }
    /**
     * Returns the player id of the owner of the lobby.
     * The owner is the first player to join the lobby.
     * If the owner leaves the lobby, the next player to join the lobby becomes the owner.
     */
    public get owner_id(): number {
        return this._owner_id;
    }
    /**
     * Returns the current's lobby settings.
     */
    public get settings(): LobbySetting {
        return {
            id: this._id,
            name: this._name,
            using_password: this.using_password,
            password: this._password,
            max_players: this._max_players,
            owner_id: this._owner_id,
            game_player_count: this._game_player_count,
            game_player_size: this._game_player_size,
            game_player_speed: this._game_player_speed,
            game_ball_size: this._game_ball_size,
            game_ball_speed: this._game_ball_speed,
            game_player_life: this._game_player_life
        };
    }
    /**
     * Returns the list of users
     */
    public get users(): { id: number, name: string, status: ConnectionStatus }[] {
        const result = [];

        this.connections.forEach((connection: ConnectionHandler) => {
            result.push({
                id: connection.connection_data.user.userId,
                name: connection.connection_data.user.username,
                status: connection.status
            });
        });

        return result;
    }

    public startGame(): any {
        console.log("[+] starting game ...");

        //ensure that the lobby has enough players to start a game.
        if (this._connections.size < this._game_player_count){
            this._game_player_count = this._connections.size;
        }

        const settings: GameSettings = {
            map: GameMap.DEFAULT,
            player_count: this._game_player_count,
            player_size: this._game_player_size,
            player_speed: this._game_player_speed,
            ball_size: this._game_ball_size,
            ball_speed : this._game_ball_speed,
            player_life: this._game_player_life
        }


        this._game = GameManager.instance.createGame(this, settings);

        if (this._game === null) {
            return {
                success: false,
                error: "GAME_CREATION_ERROR"
            };
        }

        for (const connection of this._connections.values()) {
            this._game.connectPlayer(connection);
        }

        this._game.onGameDeleting.subscribe(() => {
            this._game = null;  
        });

        return {
            success: true,
            game_id: this._id
        }
    }
    /**
     * Disconnects all connections from the lobby and dispose its events.
     */
    public delete(){
        //disconnect all connections
        this._connections.forEach((connection: ConnectionHandler) => {
            this.disconnect(connection);
        });

        if (this._game !== null) {
            this._game.delete();
            this._game = null;
        }

        this._connections.clear();
        this.onNameChange.dispose();
        this.onConnectionAdd.dispose();
        this.onConnectionRemove.dispose();
    }

    /**
     * Connects a connection to the lobby.
     * @param connection 
     * @returns 
     */
    public connect(connection: ConnectionHandler, password: string = null): any {
        if (this._connections.has(connection.connection_data.user.userId)){
            return {
                success: false,
                error: "ALLREADY_IN_A_LOBBY"
            };
        }
        if (!connection.connected) {
            return {
                success: false,
                error: "LOBBY_CONNECTION_ERROR"
            };
        }
        if (this._banned_user_ids.has(connection.connection_data.user.userId)) {
            return {
                success: false,
                error: "LOBBY_BANNED"
            };
        }
        //if the lobby has a password, ensure that the password is correct.
        if (this.using_password){
            if (password === null){
                return {
                    success: false,
                    error: "LOBBY_PASSWORD_REQUIRED"
                };
            }

            if (password !== this._password){
                return {
                    success: false,
                    error: "LOBBY_PASSWORD_INCORRECT"
                };
            }
        }
        //ensure that the lobby is not full.
        if(this._connections.size >= this._max_players){
            return {
                success: false,
                error: "LOBBY_FULL"
            };
        }

        //ensure that the connection will be removed from the lobby when it disconnects.
        connection.onDisconnect.subscribe((connection: ConnectionHandler) => {
            this.disconnect(connection);
        });

        //bind messages of the connection to the lobby.
        this.bindMessageEvents(connection);

        if (this._connections.size === 0) {
            this._owner_id = connection.connection_data.user.userId;
        }

        connection.status = ConnectionStatus.LOBBY_NOT_READY;

        this._connections.set(connection.connection_data.user.userId, connection);
        this.onNewConnection(connection);


        const paquet = {
            success: true,
            lobby_data: {
                id: this._id,
                name: this._name,
                using_password: this.using_password,
                password: this._password,
                max_players: this._max_players,
                owner_id: this._owner_id,
                game_player_count: this._game_player_count,
                game_player_size: this._game_player_size,
                game_player_speed: this._game_player_speed,
                game_ball_size: this._game_ball_size,
                game_ball_speed: this._game_ball_speed,
                game_player_life: this._game_player_life,
                users: this.users
            }
        }

        connection.socket.emit(Messages.LOBBY_JOINED, paquet);

        if (this._game !== null) {
            this._game.connectPlayer(connection);
        }
        
        return {
            success: true
        };
    }
    /**
     * Disconnects a connection from the lobby.
     * @param connection 
     * @returns 
     */
    public disconnect(connection: ConnectionHandler): boolean {
        if (!this._connections.has(connection.connection_data.user.userId)) {
            return false;
        }

        this._connections.delete(connection.connection_data.user.userId);
        this.onConnectionLeft(connection);
        this.onUserDisconnect.notify(connection);

        //if the connection is still connected, send a message to notify it that it left the lobby.
        //the if statement is here to prevent the server from sending a message to a disconnected socket.
        if (connection.connected) {
            connection.socket.emit(Messages.LOBBY_LEFT, {
                success: true,
                 lobby_data: {
                     id: this._id,
                     name: this._name
                 }
             }); 
        }

        //set the connection status to connected or disconnected depending on if the connection is still connected or not.
        connection.status = connection.connected ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED;

        // unbind messages of the connection to the lobby.
        this.unbindMessageEvents(connection);

        //if the lobby is empty, delete it.
        if (this._connections.size === 0) {
            LobbiesManager.deleteLobby(this._id);
            return true;
        }

        //if the owner leaves the lobby, the next player to join the lobby becomes the owner.
        if (this._owner_id === connection.connection_data.user.userId) {
            const new_owner = this._connections.values().next().value as ConnectionHandler;
            this.setOwner(new_owner);
        }

        return true;
    }
    /**
     * Change the name of the lobby.
     * Can only be done by the owner of the lobby.
     * @param new_name the new name of the lobby
     * @returns if the operation was successful or not and the error messages if any.
     */
    public changeName(new_name: string): any {

        const errors = [];

        if (new_name.trim().length === 0) {
            errors.push("NAME_REQUIRED");
        }
        if (new_name.length < 3) {
            errors.push("NAME_TOO_SHORT");
        }
        if (new_name.length > 25) {
            errors.push("NAME_TOO_LONG");
        }

        //clean the name from bad words.
        new_name = BanWord.clean(new_name);

        if (errors.length > 0) {
            return {
                success: false,
                messages: errors
            };
        }

        this._name = new_name;
        this.onNameChanged(new_name);

        return {
            success: true
        };
    }
    /**
     * Change the password of the lobby.
     * Can only be done by the owner of the lobby.
     * @param new_password 
     */
    public changePassword(new_password: string): any {
        const errors = [];

        if (new_password === null || new_password.length === 0) {
            this._password = null;
            this.onPasswordChanged(null);
            return {
                success: true
            };
        }

        if (new_password.length < 3) {
            errors.push("PASSWORD_TOO_SHORT");
        }
        if (new_password.length > 25) {
            errors.push("PASSWORD_TOO_LONG");
        }

        if (errors.length > 0) {
            return {
                success: false,
                messages: errors
            };
        }

        this._password = new_password;
        this.onPasswordChanged(this._password);

        return {
            success: true
        };
    }
    /**
     * Change the maximum number of players of the lobby.
     * @param new_max_players the new maximum number of players of the lobby.
     * @returns if the operation was successful or not and the error messages if any.
     */
    public changeMaxPlayers(new_max_players: number): any {
        const errors = [];

        if (new_max_players < Lobby.MIN_LOBBY_PLAYERS) {
            errors.push(`MAX_PLAYERS_TOO_LOW`);
        }
        if (new_max_players > Lobby.MAX_LOBBY_PLAYERS) {
            errors.push(`MAX_PLAYERS_TOO_HIGH`);
        }

        if (errors.length > 0) {
            return {
                success: false,
                messages: errors
            };
        }

        this._max_players = new_max_players;
        
        //if the lobby is now full, kick the last players that joined the lobby.
        if (this._connections.size > this._max_players) {
            const connections = Array.from(this._connections.keys());
            const kick_count = this._connections.size - this._max_players;
            let kicked = 0;

            //kick the last players that joined the lobby.
            for (let index = this._connections.size - 1; index >= 0; index--) {
                if (kicked === kick_count) {
                    break;
                }

                //don't kick the owner.
                if (this.owner_id === connections[index]) {
                    continue;
                }

                // //kick the player.
                // //if the kick fails, log it and continue.
                // if (!this.kickUser(connections[index]))
                // {
                //     const connection = this._connections.get(connections[index]);
                //     console.warn(`[!] Failed to kick a user from lobby : ${this._id}`);
                //     continue;
                // }

                this.kickUser(connections[index]);

                kicked++;
            }
        }

        this.onMaxPlayersChanged(new_max_players);

        return {
            success: true
        };
    }
    /**
     * Change the game player count.
     * @param new_player_count the new game player count.
     * @returns if the operation was successful or not and the error messages if any.
     */
    public changeGamePlayerCount(new_player_count: number): any {
        if (new_player_count < EngineConfig.MIN_PLAYERS) {
            return {
                success: false,
                messages: ["PLAYER_COUNT_TOO_LOW"]
            };
        }

        if (new_player_count > EngineConfig.MAX_PLAYERS) {
            return {
                success: false,
                messages: ["PLAYER_COUNT_TOO_HIGH"]
            };
        }

        this._game_player_count = new_player_count;
        
        return {
            success: true
        };
    }
    /**
     * Change the game player size.
     * @param new_player_size the new game player size.
     * @returns if the operation was successful or not and the error messages if any.
     */
    public changeGamePlayerSize(new_player_size: Size): any {
        if (new_player_size.width < EngineConfig.MIN_PLAYER_SIZE.width || new_player_size.height < EngineConfig.MIN_PLAYER_SIZE.height) {
            return {
                success: false,
                messages: ["PLAYER_SIZE_TOO_LOW"]
            };
        }

        if (new_player_size.width > EngineConfig.MAX_PLAYER_SIZE.width || new_player_size.height > EngineConfig.MAX_PLAYER_SIZE.height) {
            return {
                success: false,
                messages: ["PLAYER_SIZE_TOO_HIGH"]
            };
        }

        this._game_player_size = new_player_size;

        return {
            success: true
        };
    }
    /**
     * Change the game player speed.
     * @param new_player_speed the new game player speed.
     * @returns if the operation was successful or not and the error messages if any.
     */
    public changeGamePlayerSpeed(new_player_speed: number): any {
        if (new_player_speed < EngineConfig.MIN_PLAYER_SPEED) {
            return {
                success: false,
                messages: ["PLAYER_SPEED_TOO_LOW"]
            }
        }

        if (new_player_speed > EngineConfig.MAX_PLAYER_SPEED) {
            return {
                success: false,
                messages: ["PLAYER_SPEED_TOO_HIGH"]
            }
        }

        this._game_player_speed = new_player_speed;

        return {
            success: true
        };
    }
    /**
     * Change the game ball size.
     * @param new_ball_size the new game ball size.
     * @returns if the operation was successful or not and the error messages if any.
     */
    public changeGameBallSize(new_ball_size: Size): any {
        if (new_ball_size.width < EngineConfig.MIN_BALL_SIZE.width || new_ball_size.height < EngineConfig.MIN_BALL_SIZE.height) {
            return {
                success: false,
                messages: ["BALL_SIZE_TOO_LOW"]
            };
        }

        if (new_ball_size.width > EngineConfig.MAX_BALL_SIZE.width || new_ball_size.height > EngineConfig.MAX_BALL_SIZE.height) {
            return {
                success: false,
                messages: ["BALL_SIZE_TOO_HIGH"]
            };
        }

        this._game_ball_size = new_ball_size;

        return {
            success: true
        };
    }
    /**
     * Change the game ball speed.
     * @param new_ball_speed the new game ball speed.
     * @returns if the operation was successful or not and the error messages if any.
     */
    public changeGameBallSpeed(new_ball_speed: number): any {
        if (new_ball_speed < EngineConfig.MIN_BALL_SPEED) {
            return {
                success: false,
                messages: ["BALL_SPEED_TOO_LOW"]
            }
        }

        if (new_ball_speed > EngineConfig.MAX_BALL_SPEED) {
            return {
                success: false,
                messages: ["BALL_SPEED_TOO_HIGH"]
            }
        }

        this._game_ball_speed = new_ball_speed;

        return {
            success: true
        };
    }
    /**
     * Change the game player life.
     * @param new_player_life the new game player life.
     * @returns if the operation was successful or not and the error messages if any.
     */
    public changeGamePlayerLife(new_player_life: number): any {
        if (new_player_life < EngineConfig.MIN_PLAYER_LIFE) {
            return {
                success: false,
                messages: ["PLAYER_LIFE_TOO_LOW"]
            }
        }

        if (new_player_life > EngineConfig.MAX_PLAYER_LIFE) {
            return {
                success: false,
                messages: ["PLAYER_LIFE_TOO_HIGH"]
            }
        }

        this._game_player_life = new_player_life;

        return {
            success: true
        };
    }

    /**
     * Sets the owner of the lobby.
     * @param connection the connection of the new owner.
     * @returns if the operation was successful or not.
     */
    public setOwner(connection: ConnectionHandler): boolean {
        //the user is not in the lobby.
        if (!this._connections.has(connection.connection_data.user.userId)) {
            return false;
        }

        //the user is already the owner.
        if (this._owner_id === connection.connection_data.user.userId) {
            return false;
        }

        this._owner_id = connection.connection_data.user.userId;
        this.onOwnerChanged(connection);
        console.log(`[+] User: ${connection.connection_data.user.userId} as been promoted to owner of lobby : ${this._id}`);
        return true;
    }
    /**
     * Ban a user from the lobby.
     * @param user_id the id of the user to ban.
     * @returns if the operation was successful or not.
     */
    public banUser(user_id: number): boolean {
        this._banned_user_ids.add(user_id);

        if(this._connections.has(user_id)){
            const connection = this._connections.get(user_id);
            connection.socket.emit(Messages.LOBBY_BANNED, {});
            this.disconnect(connection);
        }

        this.onUserBan.notify(user_id);
        console.log(`[+] User: ${user_id} as been banned from lobby : ${this._id} by user: ${this._owner_id}`);
        return true;
    }
    /**
     * Unban a user from the lobby.
     * @param user_id the id of the user to unban.
     */
    public unbanUser(user_id: number): void {
        this._banned_user_ids.delete(user_id);
        this.onUserUnBan.notify(user_id);
    }
    /**
     * Kick a user from the lobby.
     * @param user_id  the id of the user to kick.
     * @returns if the operation was successful or not.
     */
    public kickUser(user_id: number): boolean {
        if (!this._connections.has(user_id)) {
            return false;
        }

        const connection = this._connections.get(user_id);
        connection.socket.emit(Messages.LOBBY_KICKED, {});
        this.disconnect(connection);
        this.onUserKick.notify(user_id);
        console.log(`[+] User: ${user_id} as been kicked from lobby : ${this._id} by user: ${this._owner_id}`);
    }
    public setReady(user_id: number, ready: boolean): void {
        if (!this._connections.has(user_id)) {
            return;
        }

        const connection = this._connections.get(user_id);
        connection.status = ready ? ConnectionStatus.LOBBY_READY : ConnectionStatus.LOBBY_NOT_READY;
        this.onUserStatusChange.notify(connection);
        this.sendMessageToAllConnections(Messages.LOBBY_USERS_CHANGED, this.users);
        this.checkForStart();
    }

    private checkForStart(): void {
        if (this._connections.size < Lobby.MIN_LOBBY_PLAYERS) {
            return;
        }

        for (const connection of this._connections.values()) {
            if (connection.status !== ConnectionStatus.LOBBY_READY) {
                return;
            }
        }

        this.startGame();
    }

    /**
     * On a new user joined the lobby.
     * @param connection 
     */
    private onNewConnection(connection: ConnectionHandler) {
        this.sendMessageToAllConnections(Messages.LOBBY_USERS_CHANGED, this.users);
        this.checkForStart();
        this.onConnectionAdd.notify(connection);
    }
    /**
     * On an user left the lobby.
     * @param connection 
     */
    private onConnectionLeft(connection: ConnectionHandler) {
        this.sendMessageToAllConnections(Messages.LOBBY_USERS_CHANGED, this.users);
        this.checkForStart();
        this.onConnectionRemove.notify(connection);
    }
    /**
     * On the name of the lobby changed.
     * @param name 
     */
    private onNameChanged(name: string) {
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
        this.onNameChange.notify(name);
    }
    /**
     * On the max player of the lobby changed.
     * @param max_player 
     */
    private onMaxPlayersChanged(max_player: number) {
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
        this.onMaxPlayersChange.notify(max_player);
    }
    /**
     * On the owner of the lobby changed.
     * @param owner 
     */
    private onOwnerChanged(owner: ConnectionHandler) {
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
        this.onOwnerChange.notify(owner);
    }
    /**
     * Called when the password of the lobby changed.
     * @param new_password_hash the new password hash.
     */
    private onPasswordChanged(new_password_hash: string) {
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
        this.onPasswordChange.notify(new_password_hash);
    }
    /**
     * Called when the player count of the game changed.
     * @param player_count the new player count.
     */
    private onGamePlayerCountChanged(player_count: number) {
        this.onGamePlayerCountChange.notify(player_count);
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
    }
    /**
     * Called when the player size of the game changed.
     * @param player_size the new player size.
     */
    private onGamePlayerSizeChanged(player_size: Size) {
        this.onGamePlayerSizeChange.notify(player_size);
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
    }
    /**
     * Called when the player speed of the game changed.
     * @param player_speed the new player speed.
     */
    private onGamePlayerSpeedChanged(player_speed: number) {
        this.onGamePlayerSpeedChange.notify(player_speed);
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
    }
    /**
     * Called when the ball size of the game changed.
     * @param ball_size the new ball size.
     */
    private onGameBallSizeChanged(ball_size: Size) {
        this.onGameBallSizeChange.notify(ball_size);
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
    }
    /**
     * Called when the ball speed of the game changed.
     * @param ball_speed the new ball speed.
     */
    private onGameBallSpeedChanged(ball_speed: number) {
        this.onGameBallSpeedChange.notify(ball_speed);
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
    }
    /**
     * Called when the player life of the game changed.
     * @param player_life the new player life.
     */
    private onGamePlayerLifeChanged(player_life: number) {
        this.onGamePlayerLifeChange.notify(player_life);
        this.sendMessageToAllConnections(Messages.LOBBY_SETTINGS_CHANGED, this.settings);
    }

    /**
     * Bind all the message events to the connection.
     * @param connection 
     */
    private bindMessageEvents(connection: ConnectionHandler) {
        
        //on user send a request to leave the lobby.
        connection.socket.on(Messages.LOBBY_LEAVE, (data: any) => {
            //check if the user is in the lobby.
            if (!this._connections.has(connection.connection_data.user.userId)) {
                connection.socket.emit(Messages.LOBBY_LEAVE_RESPONSE, {
                    success: false,
                    messages: ["NOT_IN_LOBBY"]
                });
            }

            const result = this.disconnect(connection);
            connection.socket.emit(Messages.LOBBY_LEAVE_RESPONSE, {
                success: result
            });
        });
        
        //on user send a request to change the name of the lobby.
        connection.socket.on(Messages.LOBBY_CHANGE_NAME, (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_NAME_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }
            const result = this.changeName(data.name);
            connection.socket.emit(Messages.LOBBY_CHANGE_NAME_RESPONSE, result);
        });

        //on user send a request to change the owner of the lobby.
        connection.socket.on(Messages.LOBBY_CHANGE_OWNER, (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_OWNER_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const new_owner = this._connections.get(data.new_owner_id);
            if (!new_owner) {
                connection.socket.emit(Messages.LOBBY_CHANGE_OWNER_RESPONSE, {
                    success: false,
                    messages: ["USER_NOT_IN_LOBBY"]
                });
                return;
            }

            const result = this.setOwner(new_owner);
            connection.socket.emit(Messages.LOBBY_CHANGE_OWNER_RESPONSE, {
                success: result
            });
        });

        //on user send a request to ban a user from the lobby.
        connection.socket.on(Messages.LOBBY_BAN_USER, (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_BAN_USER_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.banUser(data.user_id);
            connection.socket.emit(Messages.LOBBY_BAN_USER_RESPONSE, {
                success: result
            });
        });

        //on user send a request to unban a user from the lobby.
        connection.socket.on(Messages.LOBBY_UNBAN_USER, (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_UNBAN_USER_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            this.unbanUser(data.user_id);
            connection.socket.emit(Messages.LOBBY_UNBAN_USER_RESPONSE, {
                success: true
            });
        });

        //on user send a request to kick a user from the lobby.
        connection.socket.on(Messages.LOBBY_KICK_USER, (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_KICK_USER_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.kickUser(data.user_id);
            connection.socket.emit(Messages.LOBBY_KICK_USER_RESPONSE, {
                success: result
            });
        });

        //on user send a request to promote a user to owner.
        connection.socket.on(Messages.LOBBY_PROMOTE_USER, (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_PROMOTE_USER_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const new_owner = this._connections.get(data.user_id);
            if (!new_owner) {
                connection.socket.emit(Messages.LOBBY_PROMOTE_USER_RESPONSE, {
                    success: false,
                    messages: ["USER_NOT_IN_LOBBY"]
                });
                return;
            }

            const result = this.setOwner(new_owner);
            connection.socket.emit(Messages.LOBBY_PROMOTE_USER_RESPONSE, {
                success: result
            });
        });

        //on user send a request to change the password of the lobby.
        connection.socket.on(Messages.LOBBY_CHANGE_PASSWORD, (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_PASSWORD_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.changePassword(data.password);
            if (!result.success) {
                connection.socket.emit(Messages.LOBBY_CHANGE_PASSWORD_RESPONSE, {
                    success: false,
                    messages: result.messages
                });

                return;
            }

            connection.socket.emit("lobby-change-password-response", {
                success: true
            });
        });

        //on user send a request to change the max player of the lobby.
        connection.socket.on(Messages.LOBBY_CHANGE_MAX_PLAYERS, (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_MAX_PLAYERS_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.changeMaxPlayers(data.max_player);
            if (!result.success) {
                connection.socket.emit(Messages.LOBBY_CHANGE_MAX_PLAYERS_RESPONSE, {
                    success: false,
                    messages: result.messages
                });

                return;
            }

            connection.socket.emit(Messages.LOBBY_CHANGE_MAX_PLAYERS_RESPONSE, {
                success: true,
            });
        });

        //on user send a request to change the max player of the lobby.
        connection.socket.on(Messages.LOBBY_CHANGE_GAME_PLAYER_COUNT, (data: {player_count: number}) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_COUNT_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.changeGamePlayerCount(data.player_count);
            if (!result.success) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_COUNT_RESPONSE, {
                    success: false,
                    messages: result.messages
                });

                return;
            }

            connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_COUNT_RESPONSE, {
                success: true
            });

            this.onGamePlayerCountChanged(data.player_count);
        });

        //on user send a request to change the player size
        connection.socket.on(Messages.LOBBY_CHANGE_GAME_PLAYER_SIZE, (data: {player_size: Size}) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_SIZE_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.changeGamePlayerSize(data.player_size);
            if (!result.success) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_SIZE_RESPONSE, {
                    success: false,
                    messages: result.messages
                });

                return;
            }

            connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_SIZE_RESPONSE, {
                success: true
            });

            this.onGamePlayerSizeChanged(data.player_size);
        });

        //on user send a request to change the player speed
        connection.socket.on(Messages.LOBBY_CHANGE_GAME_PLAYER_SPEED, (data: {player_speed: number}) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_SPEED_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.changeGamePlayerSpeed(data.player_speed);
            if (!result.success) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_SPEED_RESPONSE, {
                    success: false,
                    messages: result.messages
                });

                return;
            }

            connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_SPEED_RESPONSE, {
                success: true
            });

            this.onGamePlayerSpeedChanged(data.player_speed);
        });

        //on user send a request to change the ball size
        connection.socket.on(Messages.LOBBY_CHANGE_GAME_BALL_SIZE, (data: {ball_size: Size}) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_BALL_SIZE_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.changeGameBallSize(data.ball_size);
            if (!result.success) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_BALL_SIZE_RESPONSE, {
                    success: false,
                    messages: result.messages
                });

                return;
            }

            connection.socket.emit(Messages.LOBBY_CHANGE_GAME_BALL_SIZE_RESPONSE, {
                success: true
            });

            this.onGameBallSizeChanged(data.ball_size);
        });

        //on user send a request to change the ball speed
        connection.socket.on(Messages.LOBBY_CHANGE_GAME_BALL_SPEED, (data: {ball_speed: number}) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_BALL_SPEED_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.changeGameBallSpeed(data.ball_speed);
            if (!result.success) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_BALL_SPEED_RESPONSE, {
                    success: false,
                    messages: result.messages
                });
                
                return;
            }

            connection.socket.emit(Messages.LOBBY_CHANGE_GAME_BALL_SPEED_RESPONSE, {
                success: true
            });

            this.onGameBallSpeedChanged(data.ball_speed);
        });

        //on user send a request to change the player life
        connection.socket.on(Messages.LOBBY_CHANGE_GAME_PLAYER_LIFE, (data: {player_life: number}) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_LIFE_RESPONSE, {
                    success: false,
                    messages: ["NOT_OWNER"]
                });
                return;
            }

            const result = this.changeGamePlayerLife(data.player_life);
            if (!result.success) {
                connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_LIFE_RESPONSE, {
                    success: false,
                    messages: result.messages
                });

                return;
            }

            connection.socket.emit(Messages.LOBBY_CHANGE_GAME_PLAYER_LIFE_RESPONSE, {
                success: true
            });

            this.onGamePlayerLifeChanged(data.player_life);
        });

        //on user send a request to set if is ready or not.
        connection.socket.on(Messages.LOBBY_SET_READY, (data: {ready: boolean}) => {
            this.setReady(connection.connection_data.user.userId, data.ready);
        });
    }
    /**
     * Unbind all the message events to the connection.
     * @param connection the connection to unbind the message events.
     */
    private unbindMessageEvents(connection: ConnectionHandler) {
        if (connection.socket === null) return;
        const socket = connection.socket;

        socket.removeAllListeners(Messages.LOBBY_LEAVE);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_NAME);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_OWNER);
        socket.removeAllListeners(Messages.LOBBY_BAN_USER);
        socket.removeAllListeners(Messages.LOBBY_UNBAN_USER);
        socket.removeAllListeners(Messages.LOBBY_KICK_USER);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_PASSWORD);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_MAX_PLAYERS);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_GAME_PLAYER_COUNT);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_GAME_PLAYER_SIZE);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_GAME_PLAYER_SPEED);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_GAME_BALL_SIZE);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_GAME_BALL_SPEED);
        socket.removeAllListeners(Messages.LOBBY_CHANGE_GAME_PLAYER_LIFE);
        socket.removeAllListeners(Messages.LOBBY_SET_READY);
    }
    /**
     * Send a message to all the connections in the lobby.
     * @param message 
     * @param data 
     */
    public sendMessageToAllConnections(message: string, data: any) {
        for (let connection of this._connections.values()) {
            connection.socket.emit(message, data);
        }
    }
}