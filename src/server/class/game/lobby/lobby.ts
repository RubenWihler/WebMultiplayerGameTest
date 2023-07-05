import ConnectionHandler, { ConnectionStatut } from "../../connection/connection_handler.js";
import ObservableEvent from "../../event_system/observable_event.js";
import BanWord from "../../global_types/ban_word.js";
import LobbiesManager from "./lobbies_manager.js";

export default class Lobby {
    private readonly _id: string;
    private readonly _connections: Map<number, ConnectionHandler>;
    private _name: string;
    private _owner_id: number;
    private _banned_user_ids: Set<number>;

    public readonly onConnectionAdd: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    public readonly onConnectionRemove: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    public readonly onNameChange: ObservableEvent<string> = new ObservableEvent();
    public readonly onOwnerChange: ObservableEvent<ConnectionHandler> = new ObservableEvent();
    public readonly onUserBan: ObservableEvent<number> = new ObservableEvent();
    public readonly onUserUnBan: ObservableEvent<number> = new ObservableEvent();
    public readonly onUserKick: ObservableEvent<number> = new ObservableEvent();


    constructor(id: string, name: string) {
        this._id = id;
        this._name = name;
        this._owner_id = null;
        this._banned_user_ids = new Set<number>();
        this._connections = new Map<number, ConnectionHandler>();
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
     * returns all the connections in the lobby.
     */
    public get connections(): ConnectionHandler[] {
        return Array.from(this._connections.values());
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
    public connect(connection: ConnectionHandler): any {
        if (this._connections.has(connection.connection_data.user.userId)){
            return {
                sucess: false,
                error: "You are already in this lobby."
            };
        }
        if (connection.statut !== ConnectionStatut.CONNECTED) {
            return {
                sucess: false,
                error: "An error occured while joining the lobby! Please try logging out and logging back in."
            };
        }
        if (this._banned_user_ids.has(connection.connection_data.user.userId)) {
            return {
                sucess: false,
                error: "You are banned from this lobby."
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

        connection.socket.emit("lobby-joined", {
            sucess: true,
            lobby_data: {
                id: this._id,
                name: this._name,
                owner_id: this._owner_id
            }
        });

        return {
            sucess: true
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

        //if the owner leaves the lobby, the next player to join the lobby becomes the owner.
        if (this._owner_id === connection.connection_data.user.userId) {
            const new_owner = this._connections.values().next().value;
            this._owner_id = new_owner.connection_data.user.userId;
        }

        this._connections.delete(connection.connection_data.user.userId);
        this.onConnectionLeft(connection);

        connection.socket.emit("lobby-left", {
           sucess: true,
            lobby_data: {
                id: this._id,
                name: this._name
            }
        }); 

        //if the lobby is empty, delete it.
        if (this._connections.size === 0) {
            LobbiesManager.deleteLobby(this._id);
        }

        return true;
    }
    /**
     * Change the name of the lobby.
     * @param new_name the new name of the lobby
     * @returns if the operation was successful or not and the error messages if any.
     */
    public changeName(new_name: string): any {

        const errors = [];

        if (new_name.trim().length === 0) {
            errors.push("The name must not be only spaces.");
        }
        if (new_name.length < 3) {
            errors.push("The name must be at least 3 characters long.");
        }
        if (new_name.length > 25) {
            errors.push("The name must be at most 25 characters long.");
        }

        //clean the name from bad words.
        new_name = BanWord.clean(new_name);

        if (errors.length > 0) {
            return {
                sucess: false,
                messages: errors
            };
        }

        this._name = new_name;
        this.onNameChanged(new_name);

        return {
            sucess: true
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
            connection.socket.emit("lobby-banned", {});
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
        connection.socket.emit("lobby-kicked", {});
        this.disconnect(connection);
        this.onUserBan.notify(user_id);
    }

    /**
     * On a new user joined the lobby.
     * @param connection 
     */
    private onNewConnection(connection: ConnectionHandler) {
        const users = [];
        for (let connection of this._connections.values()) {
            users.push({
                user_id: connection.connection_data.user.userId,
                username: connection.connection_data.user.username
            });
        }
        const paquet = {
            new_user: {
                user_id: connection.connection_data.user.userId,
                username: connection.connection_data.user.username
            },
            users: users
        };

        this.sendMessageToAllConnections("lobby-connection-add", paquet);
        this.onConnectionAdd.notify(connection);
    }
    /**
     * On an user left the lobby.
     * @param connection 
     */
    private onConnectionLeft(connection: ConnectionHandler) {
        const users = [];
        for (let connection of this._connections.values()) {
            users.push({
                user_id: connection.connection_data.user.userId,
                username: connection.connection_data.user.username
            });
        }
        const paquet = {
            leaved_user: {
                user_id: connection.connection_data.user.userId,
                username: connection.connection_data.user.username
            },
            users: users
        };

        this.sendMessageToAllConnections("lobby-connection-remove", paquet);
        this.onConnectionRemove.notify(connection);
    }
    /**
     * On the name of the lobby changed.
     * @param name 
     */
    private onNameChanged(name: string) {
        const paquet = {
            new_name: name
        };

        this.sendMessageToAllConnections("lobby-name-change", paquet);
        this.onNameChange.notify(name);
    }
    /**
     * On the owner of the lobby changed.
     * @param owner 
     */
    private onOwnerChanged(owner: ConnectionHandler) {
        const paquet = {
            new_owner_id: owner.connection_data.user.userId,
        };

        this.sendMessageToAllConnections("lobby-owner-change", paquet);
        this.onOwnerChange.notify(owner);
    }

    private bindMessageEvents(connection: ConnectionHandler) {
        //on user send a request to change the name of the lobby.
        connection.socket.on("lobby-change-name", (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit("lobby-change-name-response", {
                    sucess: false,
                    messages: ["You are not the owner of the lobby."]
                });
                return;
            }
            const result = this.changeName(data.name);
            connection.socket.emit("lobby-change-name-response", result);
        });

        //on user send a request to change the owner of the lobby.
        connection.socket.on("lobby-change-owner", (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit("lobby-change-owner-response", {
                    sucess: false,
                    messages: ["You are not the owner of the lobby."]
                });
                return;
            }

            const new_owner = this._connections.get(data.new_owner_id);
            if (!new_owner) {
                connection.socket.emit("lobby-change-owner-response", {
                    sucess: false,
                    messages: ["The targeted player is not in the lobby or does not exist."]
                });
                return;
            }

            const result = this.setOwner(new_owner);
            connection.socket.emit("lobby-change-owner-response", {
                sucess: result
            });
        });

        //on user send a request to ban a user from the lobby.
        connection.socket.on("lobby-ban-user", (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit("lobby-ban-user-response", {
                    sucess: false,
                    messages: ["You are not the owner of the lobby."]
                });
                return;
            }

            const result = this.banUser(data.user_id);
            connection.socket.emit("lobby-ban-user-response", {
                sucess: result
            });
        });

        //on user send a request to unban a user from the lobby.
        connection.socket.on("lobby-unban-user", (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit("lobby-unban-user-response", {
                    sucess: false,
                    messages: ["You are not the owner of the lobby."]
                });
                return;
            }

            this.unbanUser(data.user_id);
            connection.socket.emit("lobby-unban-user-response", {
                sucess: true
            });
        });

        //on user send a request to kick a user from the lobby.
        connection.socket.on("lobby-kick-user", (data: any) => {
            if (connection.connection_data.user.userId !== this._owner_id) {
                connection.socket.emit("lobby-kick-user-response", {
                    sucess: false,
                    messages: ["You are not the owner of the lobby."]
                });
                return;
            }

            const result = this.kickUser(data.user_id);
            connection.socket.emit("lobby-kick-user-response", {
                sucess: result
            });
        });
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