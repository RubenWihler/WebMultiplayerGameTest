import UserProcessor from "../database/processor/user_processor.js";
import ConnectionHandler from "./connection_handler.js";
import Messages from "./messages.js";

export default class ConnectionsManager{
    private static instance: ConnectionsManager;

    private current_connections: ConnectionHandler[];

    public static get Instance(): ConnectionsManager {
        if (ConnectionsManager.instance == null || ConnectionsManager.instance == undefined) {
            ConnectionsManager.instance = new ConnectionsManager();
        }

        return ConnectionsManager.instance;
    }

    public static get CurrentConnections(): ConnectionHandler[] {
        return this.Instance.current_connections;
    }

    constructor(){
        ConnectionsManager.instance = this;
        this.current_connections = [];
    }

    public addConnection(connection_handler: ConnectionHandler): Boolean {
        const connections_to_remove: ConnectionHandler[] = [];

        this.current_connections.forEach(connection => {
            if (connection.connection_data.user.userId == connection_handler.connection_data.user.userId){
                connections_to_remove.push(connection);
            }
        });

        connections_to_remove.forEach((connection) => {
            connection.socket.emit(Messages.CONNECTION_ERROR, {
                code: "OTHER_DEVICE_LOGGED_IN",
            });

            // await setTimeout(() => {}, 1000);
            console.warn(`[!] disconnecting user: ${connection.connection_data.user.userId} because of a new connection from the same user: ${connection_handler.connection_data.user.userId}`);
            connection.disconnect();
        });

        this.current_connections.push(connection_handler);
        return true;
    }
    public removeConnection(connection_handler: ConnectionHandler): Boolean {
        const index = this.current_connections.indexOf(connection_handler);
        this.current_connections.splice(index, 1);
        return true;
    }
}