import * as socketIO from 'socket.io';
import ObservableEvent from "../event_system/observable_event.js";
import ConnectionData from "./connection_types/connection_data.js";
import ConnectionsManager from "./connections_manager.js";
import SocketManager from './socket_manager.js';
import LobbiesManager from '../game/lobby/lobbies_manager.js';
import Messages from './messages.js';

export class ConnectionStatus {
    static readonly CONNECTED = "CONNECTED";
    static readonly DISCONNECTED = "DISCONNECTED";
    static readonly LOBBY_READY = "LOBBY_READY";
    static readonly LOBBY_NOT_READY = "LOBBY_NOT_READY";
    static readonly IN_GAME = "IN_GAME";
}

/**
 * Represent a handler for a connection to the server.
 */
export default class ConnectionHandler {
    connection_data: ConnectionData;
    private _status : ConnectionStatus;
    private _connected : boolean;
    socket : socketIO.Socket;

    onConnect : ObservableEvent<ConnectionHandler> = new ObservableEvent();
    onDisconnect : ObservableEvent<ConnectionHandler> = new ObservableEvent();
    onStatutChanged : ObservableEvent<ConnectionStatus> = new ObservableEvent();

    private _hardCodedMessages: Map<string, (data: any) => void>;

    constructor() {
        this.connection_data = null;
        this._status = ConnectionStatus.DISCONNECTED;
        this._connected = false;
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

    public get status() : ConnectionStatus {
        return this._status;
    }

    public set status(statut : ConnectionStatus) {
        this._status = statut;
        this.onStatutChanged.notify(this._status);
    }

    public get connected() : boolean {
        return this._connected;
    }

    /**
     * Set the connection data and change the statut to connected.
     * @param connection_data the connection data to set.
     * @param socket the socket to set.
     * @returns 
     */
    connect(connection_data: ConnectionData, socket: socketIO.Socket) {
        if (this.connected) return;
        this.connection_data = connection_data;
        this._status = ConnectionStatus.CONNECTED;
        this._connected = true;
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
        if (!this.connected) return;
        
        this._status = ConnectionStatus.DISCONNECTED;
        this._connected = false;

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