import ConnectionHandler from "../connection/connection_handler.js";
import Lobby from "../lobby/lobby.js";
import GameManager from "./game_manager.js";
import GameSettings from "./game_settings.js";
import GameStatus from "./game_status.js";
import PlayerConnectionHandler from "./handler/player_connection_handler.js";
import Player from "./server_game_engine/game_objects/entities/player.js";

export default class Game {
    private _lobby: Lobby;
    private _settings: GameSettings;
    private _status: GameStatus;

    private _players: Map<number, Player>;

    public constructor(lobby: Lobby, settings: GameSettings){
        this._lobby = lobby;
        this._settings = settings;
        this._status = GameStatus.WAITING;
    }

    public get status(): GameStatus{
        return this._status;
    }

    private get __id(): string{
        return this._lobby.id;
    }

    /**
     * Returns an object containing the connection handler and the player of the given id
     * @param id the id of the player (same as user's id in database) 
     */
    public getConnectionHandlerOfPlayer(id: number): PlayerConnectionHandler{
        const player = this._players.get(id);
        const connectionHandler = this._lobby.connectionsMap.get(id);
        if (!player || !connectionHandler) return null;

        return {
            connectionHandler: connectionHandler,
            player: player
        }
    }

    public delete(){
        if (this._status == GameStatus.ENDED) return;
        this._status = GameStatus.ENDED;

        GameManager.instance.deleteGame(this.__id);
    }


    private connectPlayer(connectionHandler: ConnectionHandler): any{
        if (this._status != GameStatus.WAITING) return {
            success: false,
            messages: ["GAME_ALREADY_STARTED"]
        };


        
        
    }

    private bindMessages(connectionHandler: ConnectionHandler){
        const socket = connectionHandler.socket;
    }
}