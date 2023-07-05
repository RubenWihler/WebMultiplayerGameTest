import * as socketIO from 'socket.io';
import ObservableEvent from "../event_system/observable_event.js";
import ConnectionData from "./connection_types/connection_data.js";
import ConnectionsManager from "./connections_manager.js";
import SocketManager from './socket_manager.js';

export class ConnectionStatut {
    static readonly CONNECTED = "CONNECTED";
    static readonly DISCONNECTED = "DISCONNECTED";
}

/**
 * Represent a handler for a connection to the server.
 */
export default class ConnectionHandler {
    connection_data: ConnectionData;
    statut : ConnectionStatut;
    socket : socketIO.Socket;

    onConnect : ObservableEvent<ConnectionHandler> = new ObservableEvent();
    onDisconnect : ObservableEvent<ConnectionHandler> = new ObservableEvent();

    constructor() {
        this.connection_data = null;
        this.statut = ConnectionStatut.DISCONNECTED;
        this.socket = null;
    }

    /**
     * Set the connection data and change the statut to connected.
     * @param connection_data the connection data to set.
     * @param socket the socket to set.
     * @returns 
     */
    connect(connection_data: ConnectionData, socket: socketIO.Socket) {
        if (this.statut == ConnectionStatut.CONNECTED) return;
        this.connection_data = connection_data;
        this.statut = ConnectionStatut.CONNECTED;
        this.socket = socket;
        
        for (const [message, callback] of SocketManager.listeningMessagesForLoggedConnections.entries()) {            
            this.socket.on(message, (data) => {
                callback(this, data);
            });
        }

        ConnectionsManager.Instance.addConnection(this);
        this.onConnect.notify(this);
    }

    disconnect() {
        if (this.statut == ConnectionStatut.DISCONNECTED) return;
        
        this.connection_data = null;
        this.statut = ConnectionStatut.DISCONNECTED;
        
        ConnectionsManager.Instance.removeConnection(this);

        if (this.socket != null){
            this.socket.disconnect();
        }

        this.onDisconnect.notify(this);
    }
}