import ConnectionHandler, { ConnectionStatut } from "../../connection/connection_handler.js";
import HashTools from "../../global_types/hash_tools.js";
import ObservableEvent from "../../event_system/observable_event.js";
import BanWord from "../../global_types/ban_word.js";
import LobbiesManager from "./lobbies_manager.js";
import Messages from "../../connection/messages.js";

export default class Lobby {
    public static readonly MIN_LOBBY_PLAYERS = 2;
    public static readonly MAX_LOBBY_PLAYERS = 8;

    private readonly _id: string;
    private readonly _connections: Map<number, ConnectionHandler>;
    private _password_hash: string;
    private _max_players: number;
    private _name: string;
    private _owner_id: number;
    private _banned_user_ids: Set<number>;

    public readonly onConnectionAdd: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    public readonly onConnectionRemove: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    public readonly onNameChange: ObservableEvent<string> = new ObservableEvent();
    public readonly onPasswordChange: ObservableEvent<string> = new ObservableEvent();
    public readonly onMaxPlayersChange: ObservableEvent<number> = new ObservableEvent();
    public readonly onOwnerChange: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    public readonly onUserBan: ObservableEvent<number> = new ObservableEvent();
    public readonly onUserUnBan: ObservableEvent<number> = new ObservableEvent();
    public readonly onUserKick: ObservableEvent<number> = new ObservableEvent();

    constructor(id: string, name: string, password: string = null) {
        this._id = id;
        this._name = name;
        this._owner_id = null;
        this._banned_user_ids = new Set<number>();
        this._connections = new Map<number, ConnectionHandler>();
        this._password_hash = password != null ? HashTools.hash(password) : null;
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
        return this._password_hash;
    }
    /**
     * Returns true if the lobby has a password. False otherwise.
     */
    public get using_password(): boolean {
        return this._password_hash !== null;
    }
    /**
     * returns all the connections in the lobby.
     */
    public get connections(): ConnectionHandler[] {
        return Array.from(this._connections.values());
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
    public get settings(): { id: string, name: string, max_players: number, owner_id: number } {
        return {
            id: this._id,
            name: this._name,
            max_players: this._max_players,
            owner_id: this._owner_id
        };
    }
    /**
     * Returns the list of users
     */
    public get users(): { id: number, name: string }[] {
        return this.connections.map((connection: ConnectionHandler) => {
            return {
                id: connection.connection_data.user.userId,
                name: connection.connection_data.user.username
            };
        });
    }

    /**
     * Disconnects all connections from the lobby and dispose its events.
     */
    public delete(){
        //disconnect all connections
        this._connections.forEach((connection: ConnectionHandler) => {
            this.disconnect(connection);
        });

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
        if (connection.statut !== ConnectionStatut.CONNECTED) {
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

            if (!HashTools.compareHash(password, this._password_hash)){
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

        this._connections.set(connection.connection_data.user.userId, connection);
        this.onNewConnection(connection);


        const users = [];
        for (let connection of this._connections.values()) {
            users.push({
                user_id: connection.connection_data.user.userId,
                username: connection.connection_data.user.username,
            });
        }
        const paquet = {
            success: true,
            lobby_data: {
                id: this._id,
                name: this._name,
                using_password: this.using_password,
                max_players: this._max_players,
                owner_id: this._owner_id,
                users: users
            }
        }

        connection.socket.emit("lobby-joined", paquet);
        
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

        if (connection.statut === ConnectionStatut.CONNECTED) {
            connection.socket.emit("lobby-left", {
                success: true,
                 lobby_data: {
                     id: this._id,
                     name: this._name
                 }
             }); 
        }

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

        if (new_password === null) {
            this._password_hash = null;
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

        this._password_hash = HashTools.hash(new_password);
        this.onPasswordChanged(this._password_hash);

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
        this.onMaxPlayersChanged(new_max_players);

        //if the lobby is now full, kick the last players that joined the lobby.
        if (this._connections.size > this._max_players) {
            const connections = Array.from(this._connections.keys());
            const kick_count = this._connections.size - this._max_players;
            let kicked = 0;

            //kick the last players that joined the lobby.
            for (let index = this._connections.size - 1; index < this._connections.size; index--) {
                if (kicked === kick_count) {
                    break;
                }

                //don't kick the owner.
                if (this.owner_id === connections[index]) {
                    continue;
                }

                //kick the player.
                //if the kick fails, log it and continue.
                if (!this.kickUser(connections[index]))
                {
                    const connection = this._connections.get(connections[index]);
                    console.warn(`[!] Failed to kick user : ${connection.connection_data.user.userId} from lobby : ${this._id}`);
                    continue;
                }

                kicked++;
            }
        }

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
        this.onUserBan.notify(user_id);
    }

    /**
     * On a new user joined the lobby.
     * @param connection 
     */
    private onNewConnection(connection: ConnectionHandler) {
        this.sendMessageToAllConnections(Messages.LOBBY_USERS_CHANGED, this.users);
        this.onConnectionAdd.notify(connection);
    }
    /**
     * On an user left the lobby.
     * @param connection 
     */
    private onConnectionLeft(connection: ConnectionHandler) {
        this.sendMessageToAllConnections(Messages.LOBBY_USERS_CHANGED, this.users);
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
        this.onPasswordChange.notify(new_password_hash);
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
    }
    /**
     * Send a message to all the connections in the lobby.
     * @param message 
     * @param data 
     */
    private sendMessageToAllConnections(message: string, data: any) {
        for (let connection of this._connections.values()) {
            connection.socket.emit(message, data);
        }
    }
}