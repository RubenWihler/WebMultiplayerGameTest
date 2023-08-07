import ConnectionHandler from "../../connection/connection_handler.js";
import Player from "../server_game_engine/game_objects/entities/player.js";

export default interface PlayerConnectionHandler{
    connectionHandler: ConnectionHandler;
    player: Player;
}