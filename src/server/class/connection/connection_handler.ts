import * as socketIO from 'socket.io';
import ObservableEvent from "../event_system/observable_event.js";
import ConnectionData from "./connection_types/connection_data.js";
import ConnectionsManager from "./connections_manager.js";
import SocketManager from './socket_manager.js';
import LobbiesManager from '../game/lobby/lobbies_manager.js';
import Messages from './messages.js';

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

    private _hardCodedMessages: Map<string, (data: any) => void>;

    constructor() {
        this.connection_data = null;
        this.statut = ConnectionStatut.DISCONNECTED;
        this.socket = null;

        this._hardCodedMessages = new Map<string, (data: any) => void>([
            ['on-lobby-created', (lobby) => {
                if (this.socket == null) return;
                this.socket.emit(Messages.LOBBY_REFRESH, LobbiesManager.lobbiesData);
            }],
            ['on-lobby-deleted', () => {
                if (this.socket == null) return;
                this.socket.emit(Messages.LOBBY_REFRESH, LobbiesManager.lobbiesData);
            }],
        ]);
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
        
        // Add all the listening messages for logged connections.
        this.addListeningMessage();

        ConnectionsManager.Instance.addConnection(this);
        this.onConnect.notify(this);
    }

    /**
     * Disconnect the connection's socket, dispose observables events, remove socket listeners and change the statut to disconnected.
     * Also make a call to the ConnectionsManager to remove the connection.
     */
    disconnect() {
        if (this.statut == ConnectionStatut.DISCONNECTED) return;
        
        this.statut = ConnectionStatut.DISCONNECTED;

        this.removeListeningMessage();
        
        ConnectionsManager.Instance.removeConnection(this);

        if (this.socket != null){
            this.socket.disconnect();
        }

        this.onDisconnect.notify(this);
    }

    private addListeningMessage() {
        for (const [message, callbacks] of SocketManager.listeningMessagesForLoggedConnections.entries()) {            
            callbacks.forEach(callback => {
                this.socket.on(message, (data) => {
                    callback(this, data);
                });
            });
        }

        LobbiesManager.onLobbyCreated.subscribe(this._hardCodedMessages.get('on-lobby-created'));
        LobbiesManager.onLobbyDeleted.subscribe(this._hardCodedMessages.get('on-lobby-deleted'));
    }
    private removeListeningMessage() {
        if (this.socket == null) return;
        SocketManager.listeningMessagesForLoggedConnections.forEach((callback, message) => {
            this.socket.removeAllListeners(message);
        });

        LobbiesManager.onLobbyCreated.unsubscribe(this._hardCodedMessages.get('on-lobby-created'));
        LobbiesManager.onLobbyDeleted.unsubscribe(this._hardCodedMessages.get('on-lobby-deleted'));
    }
}