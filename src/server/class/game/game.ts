import ConnectionHandler from "../connection/connection_handler.js";
import Messages from "../connection/messages.js";
import ObservableEvent from "../event_system/observable_event.js";
import Stack from "../global_types/stack.js";
import Lobby from "../lobby/lobby.js";
import GameManager from "./game_manager.js";
import GameSettings from "./game_settings.js";
import GameStatus from "./game_status.js";
import PlayerConnectionHandler from "./handler/player_connection_handler.js";
import EngineConfig from "./server_game_engine/engine_config.js";
import Ball from "./server_game_engine/game_objects/entities/ball.js";
import DeathZone from "./server_game_engine/game_objects/entities/death_zone.js";
import Player from "./server_game_engine/game_objects/entities/player.js";
import GameInitPackage from "./server_game_engine/packages/game_init_package.js";
import ScorePackage from "./server_game_engine/packages/score_package.js";
import UpdatePackage from "./server_game_engine/packages/update_package.js";
import { aabbCollision } from "./server_game_engine/types/collision.js";
import PlayerMovementType from "./server_game_engine/types/player_movement_type.js";
import Position from "./server_game_engine/types/position.js";
import Size from "./server_game_engine/types/size.js";

type PlayerTerrainData = {
    top: {
        exists: boolean,
        id: number
    },
    bottom: {
        exists: boolean,
        id: number
    },
    left: {
        exists: boolean,
        id: number
    },
    right: {
        exists: boolean,
        id: number
    }
}

export default class Game {
    private _lobby: Lobby;
    private _settings: GameSettings;
    private _status: GameStatus;

    /**
     * the players of the game
     * the key is the user id of the player
     * the value is the player object
     */
    private _players: Map<number, Player>;
    /**
     * the ids of the players that are spectating the game
     */
    private _spectators: number[];
    /**
     * the local ids of the players
     * the key is the user id of the player
     * the value is the local id of the player
     */
    private _player_local_id: Map<number, number>;
    private _ball: Ball;
    private _death_zones: DeathZone[];
    private _last_death_zone_player_id: number;
    /**
     * the leaderboard of the game
     * the first element is the id of the player with the highest score
     */
    private _leaderboard: Stack<number>;

    private _players_terrain_data: PlayerTerrainData;

    private _ending: boolean = false;

    //cached values
    private _collide_on_top: boolean;
    private _collide_on_bottom: boolean;
    private _collide_on_left: boolean;
    private _collide_on_right: boolean;

    /**
     * the life points of the players
     * the key is the user id of the player
     * the value is the life points of the player
     */
    private _players_life: Map<number, number>;

    public readonly onGameDeleting: ObservableEvent<void> = new ObservableEvent<void>();

    public constructor(lobby: Lobby, settings: GameSettings){
        this._lobby = lobby;
        this._settings = settings;
        this._status = GameStatus.WAITING;
        this._players = new Map();
        this._spectators = [];
        this._playerTerrainData = {
            top: { exists: false, id: -1 },
            bottom: { exists: false, id: -1 },
            left: { exists: false, id: -1 },
            right: { exists: false, id: -1 }
        };
        this._leaderboard = new Stack<number>();

        this.onGameDeleting = new ObservableEvent<void>();

        //bind functions
        this.onPlayerDisconnect = this.onPlayerDisconnect.bind(this);

        lobby.onUserDisconnect.subscribe(this.onPlayerDisconnect);
    }

    public get status(): GameStatus{
        return this._status;
    }

    private get __id(): string{
        return this._lobby.id;
    }

    private set _playerTerrainData(data: PlayerTerrainData){
        this._players_terrain_data = data;

        //update the cached values
        this._collide_on_top = !this._players_terrain_data.top.exists;
        this._collide_on_bottom = !this._players_terrain_data.bottom.exists;
        this._collide_on_left = !this._players_terrain_data.left.exists;
        this._collide_on_right = !this._players_terrain_data.right.exists;
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

        this.onGameDeleting.notify();

        if (this._lobby.onUserDisconnect != null){
            this._lobby.onUserDisconnect.unsubscribe(this.onPlayerDisconnect);
        }

        this._players.forEach(player => {
            player.destroy();
        });
        this._death_zones.forEach(death_zone => {
            death_zone.destroy();
        });
        this._ball.destroy();
        
        GameManager.instance.deleteGame(this.__id);
    }

    public start(){
        if (this._status != GameStatus.WAITING) return;
        this._status = GameStatus.STARTING;

        //initialize the game objects
        this.initObjects();

        //send the init package to all players
        this._players.forEach(player => {
            this.sendInitPackage(player.connectionHandler);
        });

        //send the score package to all players
        this.sendScorePackage();

        //start the game loop
        this.gameLoop();

        //start the first round
        this.startRound();

        console.log(`[+] Game ${this.__id} started!`);
    }

    private async end(){
        this._status = GameStatus.ENDING;
        this._ending = true;

        //send the game end leaderboard package to all players
        this.sendGameEndLeaderboardPackage();

        //wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));

        //send the game end package to all players
        this.sendGameEndPackage();

        //delete the game
        this.delete();

        console.log(`[+] Game ${this.__id} ended!`);
    }
    


    private async gameLoop(){
        //physics loop
        //updated at 66Hz (15ms)
        const time_step = 1000 / 66;

        while (this._status != GameStatus.ENDING){
            this.update();
            await new Promise(resolve => setTimeout(resolve, time_step));
        }
    }

    private update(){
        if (this._status != GameStatus.RUNNING) return;

        this._players.forEach(player => {
            player.update();
        });
        this._ball.update();

        if (this.checkCollisions()){
        }
        //check if the ball is in a death zone
        if (this.checkDeathZone()){
        }

        //check if the ball is out of bounds
        if (this.checkOutOfBounds()){
            this.onScore(this._last_death_zone_player_id);
        }

        this.sendUpdatePackage();
    }

    private checkCollisions(): boolean{
        let collided = false;

        for (const player of this._players.values()){
            //exclude the players that are spectating
            if (player.spectating) continue;

            //check collision between the player and the ball
            if (aabbCollision(player, this._ball)){
                let to_invert: 'x' | 'y' = 'x';

                if (player.localId == 0) to_invert = 'y';
                else if (player.localId == 1) to_invert = 'y';
                else if (player.localId == 2) to_invert = 'x';
                else if (player.localId == 3) to_invert = 'x';

                this._ball.onCollision(to_invert);
                collided = true;
                break;
            }
        }

        return collided;
    }
    private checkDeathZone(): boolean{
        let player_id: number = -1;

        //check if the ball is in a death zone
        this._death_zones.forEach(death_zone => {
            if (aabbCollision(death_zone, this._ball)){
                player_id = death_zone.playerId;
                console.log(`[+] COLLISION WITH DEATH ZONE OF PLAYER ${player_id} !`);
                return;
            }
        });

        //if the ball is not in a death zone, return false
        if (player_id < 0) return false;

        this._last_death_zone_player_id = player_id;
        return true;
    }
    private checkOutOfBounds(): boolean{
        const ball_position = this._ball.position;

        //in top
        if (ball_position.y < 0){
            if (this._collide_on_top){
                this._ball.onCollision('y');
                return false;
            }
            
            return true;
        }
        //in bottom
        if (ball_position.y > EngineConfig.TERRAIN_MATRIX_SIZE.y - this._ball.height){
            if (this._collide_on_bottom){
                this._ball.onCollision('y');
                return false;
            }

            return true;
        }
        //in left
        if (ball_position.x < 0){
            if (this._collide_on_left){
                this._ball.onCollision('x');
                return false;
            }

            return true;
        }
        //in right
        if (ball_position.x > EngineConfig.TERRAIN_MATRIX_SIZE.x - this._ball.width){
            if (this._collide_on_right){
                this._ball.onCollision('x');
                return false;
            }

            return true;
        }

        //the ball is not out of bounds
        return false;
    }


    /**
     * Called when a player looses a point
     */
    private onScore(playerId){
        console.log(`[+] Player ${playerId} lost a life in game ${this.__id}!`);

        const new_life = this._players_life.get(playerId) - 1;
        this._players_life.set(playerId, new_life);
        if (this.isPlayerEliminated(playerId)){
            this.onPlayerEliminated(playerId);
        }

        this.sendScorePackage();
        this.startRound();
    }

    private isPlayerEliminated(playerId: number): boolean{
        return this._players_life.get(playerId) <= 0;
    }

    private onPlayerEliminated(playerId: number){
        console.log(`[+] Player ${playerId} eliminated in game ${this.__id}!`);

        const player = this._players.get(playerId);
        
        //set in the leaderboard
        if (player.hasPlayed){
            this._leaderboard.push(playerId);
        }
        
        //remove the player from the game and add it to the spectators
        player.spectating = true;
        this._players_life.delete(playerId);
        this._spectators.push(playerId);

        this.sendPlayerUpdatePackage();

        this.checkGameEnd();
    }

    private checkGameEnd(){
        let playing_players_count : number = 0;

        this._players.forEach(player => {
            if (!player.spectating){
                playing_players_count++;
            }
        });
        
        if (playing_players_count <= 1){
            this.end();
        }
    }


    //#region Initialization

    private initObjects(){
        this.initPlayers();
        this.initBall();
        this.initDeathZones();
    }
    private initPlayers(){
        const player_count = this._settings.player_count;
        const player_terrain_data = this._players_terrain_data;
        this._player_local_id = new Map();
        this._players_life = new Map();
        let local_id = 0;

        //initialize the players
        for (const player of this._players.values()){
            //if the number of players is greater than the player count, initialize the player as a spectator
            if (local_id >= player_count){
                this.initPlayerAsSpectator(player, local_id);
                local_id++;
                continue;
            }
            
            //initialize the player normally
            this.initPlayer(player, local_id, player_count, player_terrain_data);
            local_id++;
        }

        //set the player terrain data
        this._playerTerrainData = player_terrain_data;
    }
    private initBall(){
        const ball = new Ball(
            {
                x: EngineConfig.TERRAIN_MATRIX_SIZE.x / 2,
                y:EngineConfig.TERRAIN_MATRIX_SIZE.y / 2
            },
            this._settings.ball_size,
            this._settings.ball_speed
        );

        ball.init();
        this._ball = ball;
    }
    private initDeathZones(){
        this._death_zones = [];

        for (const player of this._players.values()){
            const pos : Position = player.movementType == PlayerMovementType.Horizontal ? 
            {
                x: 0,
                y: player.y < EngineConfig.TERRAIN_MATRIX_SIZE.y / 2 ?
                    0 :
                    EngineConfig.TERRAIN_MATRIX_SIZE.y - EngineConfig.DEATH_ZONE_THICKNESS
            } : {
                x: player.x < EngineConfig.TERRAIN_MATRIX_SIZE.x / 2 ?
                    0 :
                    EngineConfig.TERRAIN_MATRIX_SIZE.x - EngineConfig.DEATH_ZONE_THICKNESS,
                y: 0
            }

            const size: Size = player.movementType == PlayerMovementType.Horizontal ?
                { width: EngineConfig.TERRAIN_MATRIX_SIZE.x, height: EngineConfig.DEATH_ZONE_THICKNESS } :
                { width: EngineConfig.DEATH_ZONE_THICKNESS, height: EngineConfig.TERRAIN_MATRIX_SIZE.y };

            const death_zone = new DeathZone(
                pos,
                size,
                player.id,
            );

            death_zone.init();

            this._death_zones.push(death_zone);
        }
    }

    private initPlayer(player: Player, localId: number, playerCount: number, player_terrain_data: PlayerTerrainData){
        this._player_local_id.set(localId, player.id);
        this._players_life.set(player.id, this._settings.player_life);

        player.localId = localId;
        player.fixed = false;
        player.color = EngineConfig.PLAYER_COLORS[playerCount][localId];
        player.spawnPosition = EngineConfig.PLAYER_SPAWN_POSITIONS[playerCount][localId];
        player.movementType = EngineConfig.PLAYER_MOVEMENT_TYPES[playerCount][localId];
        player.position = player.spawnPosition;

        //set the player size
        //if the player moves horizontally, the size is the default size
        //if the player moves vertically, the size is inverted (width becomes height and vice-versa)
        player.size = player.movementType == PlayerMovementType.Horizontal ? this._settings.player_size : {
            width: this._settings.player_size.height,
            height: this._settings.player_size.width
        };

        //set the player's terrain data
        switch (localId){
            case 0:
                player_terrain_data.top = { exists: true, id: player.id };
                break;

            case 1:
                player_terrain_data.bottom = { exists: true, id: player.id };
                break;

            case 2:
                player_terrain_data.left = { exists: true, id: player.id };
                break;

            case 3:
                player_terrain_data.right = { exists: true, id: player.id };
                break;
        }

        player.hasPlayed = true;
        player.fixed = true;
        player.init();
    }
    private initPlayerAsSpectator(player: Player, localId: number){
        const user_id = player.id;
        
        this._players.set(user_id, player);
        this._player_local_id.set(localId, user_id);
        
        player.localId = localId;
        player.fixed = false;
        player.color = 0x000000;
        player.spawnPosition = {x: -100, y: -100};
        player.movementType = PlayerMovementType.Horizontal;
        player.position = player.spawnPosition;

        player.size = {
            width: 0,
            height: 0
        };

        player.init();
        player.spectating = true;

        
        this._spectators.push(user_id);
    }

    //#endregion

    //#region Round management

    private async startRound(){
        //check if the game is ending
        if (this._ending) return;

        //check if the game is not already in round break
        if (this._status == GameStatus.IN_ROUND_BREAK) return;

        //send the round end package to all players
        this.sendRoundEndPackage();

        console.log(`[+] Starting round in game ${this.__id} ...`);

        //set the game's status to IN_ROUND_BREAK
        this._status = GameStatus.IN_ROUND_BREAK;

        //wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        //check if the game is still in round break
        if (this._status != GameStatus.IN_ROUND_BREAK) return;
        
        //setup the round
        this.roundSetup();

        this.sendRoundStartPackage();

        //unfix the players' positions
        this._players.forEach(player => {
            player.fixed = false;
        });

        //unfix the ball's position
        this._ball.fixed = false;

        this._status = GameStatus.RUNNING;
    }

    /**
     * Sets up the round
     */
    private roundSetup(){
        //set the ball's position to the center of the terrain and make it fixed
        this._ball.spawn();
        this._ball.fixed = true;

        //fix the players' positions
        this._players.forEach(player => {
            //exclude the players that are spectating
            if (player.spectating) return;

            player.tpToSpawn();
            player.fixed = true;
        });

        //remove the death zones of the players that are spectating
        this.tryRemoveUnusedDeathZones();

        //update the player terrain data
        this.updatePlayerTerrainData();
    }

    /**
     * Removes the death zones of the players that are spectating
     */
    private tryRemoveUnusedDeathZones(){
        const death_zone_to_remove = [];

        //search for the death zones of the players that are spectating
        this._death_zones.forEach(death_zone => {
            if (this._spectators.includes(death_zone.playerId)){
                death_zone_to_remove.push(death_zone);
            }
        });

        //remove the death zones of the players that are spectating
        death_zone_to_remove.forEach(death_zone => {
            this._death_zones.splice(this._death_zones.indexOf(death_zone), 1);
        });
    }

    private updatePlayerTerrainData(){
        const player_terrain_data = this._players_terrain_data;

        //reset the player terrain data
        player_terrain_data.top = { exists: false, id: -1 };
        player_terrain_data.bottom = { exists: false, id: -1 };
        player_terrain_data.left = { exists: false, id: -1 };
        player_terrain_data.right = { exists: false, id: -1 };

        //update the player terrain data
        for (const player of this._players.values()){
            //exclude the players that are spectating
            if (player.spectating) continue;

            switch (player.localId){
                case 0:
                    player_terrain_data.top = { exists: true, id: player.id };
                    break;

                case 1:
                    player_terrain_data.bottom = { exists: true, id: player.id };
                    break;

                case 2:
                    player_terrain_data.left = { exists: true, id: player.id };
                    break;

                case 3:
                    player_terrain_data.right = { exists: true, id: player.id };
                    break;
            }
        }

        //set the player terrain data
        this._playerTerrainData = player_terrain_data;
    }

    //#endregion
    

    //#region Player Connection Management

    /**
     * Connects a player to the game
     * @param connectionHandler the connection handler of the player
     * @returns an object containing the success of the operation and a messages array if the operation failed
     */
    public connectPlayer(connectionHandler: ConnectionHandler): any{
        //check if the game is finished
        if (this._status == GameStatus.ENDED || this._status == GameStatus.ENDING) return {
            success: false,
            messages: ["GAME_ENDED"]
        };

        //check if the player is joining the game as a spectator
        if (this._status == GameStatus.IN_ROUND_BREAK || this._status == GameStatus.RUNNING){
            const user_id = connectionHandler.connection_data.user.userId;
            const local_id = this._players.size;
            const player = new Player(
                connectionHandler,
                {x: 0, y: 0},
                this._settings.player_size,
                this._settings.player_speed
            );

            this._players.set(user_id, player);

            //initialize the player as a spectator
            this.initPlayerAsSpectator(player, local_id);

            //send the init package to the player
            this.sendInitPackage(player.connectionHandler);

            this.sendScorePackage();

            console.log(`[+] Player ${user_id} connected to game ${this.__id} as a spectator!`);

            return { success: true };
        }

        if (this._status != GameStatus.WAITING) return {
            success: false,
            messages: ["GAME_ALREADY_STARTED"]
        };

        const player = new Player(
            connectionHandler, 
            {x: 0, y: 0},
            this._settings.player_size, 
            this._settings.player_speed
        );

        const id = connectionHandler.connection_data.user.userId;
        this._players.set(id, player);

        console.log(`[+] Player ${connectionHandler.connection_data.user.userId} connected to game ${this.__id}!`);

        this.onPlayerConnect();

        return { success: true };
    }

    private onPlayerConnect(){
        if (this._players.size == this._settings.player_count){
            this.start();
        }
    }

    private onPlayerDisconnect = (connectionHandler: ConnectionHandler) => {
        const user_id = connectionHandler.connection_data.user.userId;
        //check if the player is in the game
        if (!this._players.has(user_id)) return;

        if (this._status == GameStatus.RUNNING){
            this.sendScorePackage();
            this.onPlayerEliminated(connectionHandler.connection_data.user.userId);

            //if player was playing, restart another round
            if (!this._players.get(user_id).spectating) this.startRound();
        }
        else if (this._status == GameStatus.IN_ROUND_BREAK){
            this.onPlayerEliminated(connectionHandler.connection_data.user.userId);
        }
    };

    //#endregion

    //#region Game packages handling

    //#region Server -> Client

    private sendInitPackage(connectionHandler: ConnectionHandler){
        const players = [];
        let local_id = 0;

        //get the players' positions
        for (const player of this._players.values()){
            //exclude the players that are spectating
            if (player.spectating) continue;

            const user_data = player.connectionHandler.connection_data.user;

            //create the player data
            const player_data = {
                user_id: player.id,
                local_id: local_id,
                name: user_data.username,
                position: {
                    x: player.x,
                    y: player.y,
                },
                size: {
                    width: player.width,
                    height: player.height
                },
                color: player.color,
                isClient: user_data.userId == connectionHandler.connection_data.user.userId,
                movement_type: player.movementType
            };

            players.push(player_data);
            local_id++;
        }

        const ball = {
            position: {
                x: this._ball.x,
                y: this._ball.y,
            },
            color: 0xFFFFFF
        };

        const settings = {
            map: this._settings.map,
            player_life: this._settings.player_life,
            player_count: this._settings.player_count,
            player_size: this._settings.player_size,
            player_speed: this._settings.player_speed,
            ball_size: this._settings.ball_size,
            ball_speed: this._settings.ball_speed
        };

        const pack: GameInitPackage = {
            players: players,
            settings: settings,
            ball: ball
        };

        connectionHandler.socket.emit(Messages.GAME_INIT, pack);
    }
    private sendScorePackage(){
        const players_score = [];

        //get the players' positions
        for (const player of this._players.values()){
            //exclude the players that have not played (spectators because they are eliminated)
            if (!player.hasPlayed) continue;
            
            //create the player data
            const player_data = {
                id: player.id,
                life: this._players_life.get(player.id),
            };

            players_score.push(player_data);
        }
        
        //create the package
        const pack: ScorePackage = {
            scores: players_score
        };

        //send the package to all players
        this._lobby.sendMessageToAllConnections(Messages.GAME_SCORE, pack);
    }
    private sendRoundStartPackage(){
        //send the package to all players
        this._lobby.sendMessageToAllConnections(Messages.GAME_ROUND_START, {});
    }
    private sendRoundEndPackage(){
        //send the package to all players
        this._lobby.sendMessageToAllConnections(Messages.GAME_ROUND_END, {});
    }
    private sendUpdatePackage(){
        const players_pos = [];

        //get the players' positions
        for (const player of this._players.values()){
            //exclude the players that are spectating
            if (player.spectating) continue;
            
            //create the player data
            const player_data = {
                id: player.id,
                x: player.x,
                y: player.y,
            };

            players_pos.push(player_data);
        }

        //get the ball's position
        const ball = {
            x: this._ball.x,
            y: this._ball.y,
        };
        
        //create the positions
        const pos = {
            players: players_pos,
            ball: ball
        };

        //create the package
        const pack: UpdatePackage = {
            positions: pos
        };

        //send the package to all players
        this._lobby.sendMessageToAllConnections(Messages.GAME_UPDATE, pack);
    }
    private sendGameEndLeaderboardPackage(){
        const leaderboard = Array<{id: number, place: number}>();

        for (let i = 0; i < this._leaderboard.size; i++){
            const id = this._leaderboard.pop();
            const place = i + 1;
            leaderboard.push({
                id: id,
                place: place
            });
        }

        const pack = {
            leaderboard: leaderboard
        };

        //send the package to all players
        this._lobby.sendMessageToAllConnections(Messages.GAME_END_LEADERBOARD, pack);
    }
    private sendGameEndPackage(){
        //send the package to all players
        this._lobby.sendMessageToAllConnections(Messages.GAME_END, {});
    }
    private sendPlayerUpdatePackage(){
        const players = [];

        for (const player of this._players.values()){
            //exclude the players that are spectating
            if (player.spectating) continue;

            const player_data = {
                id: player.id,
                local_id: player.localId
            };

            players.push(player_data);
        }

        const pack = {
            players: players
        };

        //send the package to all players
        this._lobby.sendMessageToAllConnections(Messages.GAME_PLAYERS_UPDATE, pack);
    }

    //#endregion

    //#region Client -> Server

    private bindMessages(connectionHandler: ConnectionHandler){
        const socket = connectionHandler.socket;

    }



    //#endregion

    //#endregion

    
}