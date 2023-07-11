import SocketManager from "../class/connection/socket_manager.js";
import LobbiesManager from "../class/game/lobby/lobbies_manager.js";
import BanWord from "../class/global_types/ban_word.js";

export function setUpListeningLoggedMessages(){
    // Create a lobby
    SocketManager.listenMessageForLoggedConnections('lobby-create', (connectionHandler, data) => {
        const errors = [];

        if (data.lobby_name == null || data.lobby_name == undefined || data.lobby_name.trim().length === 0){
            errors.push("LOBBY_NAME_REQUIRED");
        }
        if (data.max_players == null || data.max_players == undefined || data.max_players <= 0){
            errors.push("LOBBY_MAX_PLAYERS_REQUIRED");
        }

        if (errors.length > 0){
            connectionHandler.socket.emit('lobby-create-response', {
                success: false,
                messages: errors
            });

            return;
        }

        data.lobby_name = BanWord.clean(data.lobby_name);

        const lobby = LobbiesManager.createLobby(data.lobby_name, data.lobby_password);
        const join_result = lobby.connect(connectionHandler, data.lobby_password);

        if (!join_result.success){
            connectionHandler.socket.emit('lobby-create-response', {
                success: false,
                messages: [join_result.error]
            });

            return;
        }

        const change_max_players = lobby.changeMaxPlayers(data.max_players);
        if (!change_max_players.success){
            connectionHandler.socket.emit('lobby-create-response', {
                success: false,
                messages: change_max_players.error
            });

            return;
        }

        LobbiesManager.onLobbyCreated.notify(lobby);

        connectionHandler.socket.emit('lobby-create-response', {
            success: true,
            lobby_id: lobby.id
        });
    });
    // Join a lobby
    SocketManager.listenMessageForLoggedConnections('lobby-join', (connectionHandler, data) => {
        const lobby = LobbiesManager.getLobby(data.lobby_id);
        
        // Check if lobby exists
        if (lobby == null){
            connectionHandler.socket.emit('lobby-join-response', {
                success: false,
                messages: ["LOBBY_NOT_FOUND"]
            });

            return;
        }

        const response = lobby.connect(connectionHandler, data.lobby_password);
        if (!response.success){
            connectionHandler.socket.emit('lobby-join-response', {
                success: false,
                messages: [response.error]
            });

            return;
        }

        connectionHandler.socket.emit('lobby-join-response', {
            success: true
        });
    });

    // Get lobby list
    SocketManager.listenMessageForLoggedConnections('lobby-list', (connectionHandler, data) => {
        const lobbies = LobbiesManager.lobbiesData;

        connectionHandler.socket.emit('lobby-list-response', {
            success: true,
            lobbies: lobbies
        });

    });
}