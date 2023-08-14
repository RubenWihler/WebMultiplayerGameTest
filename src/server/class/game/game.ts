import ConnectionHandler from "../connection/connection_handler.js";
import Messages from "../connection/messages.js";
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

export default class Game {
    private _lobby: Lobby;
    private _settings: GameSettings;
    private _status: GameStatus;

    private _players: Map<number, Player>;
    private _player_local_id: Map<number, number>;
    private _ball: Ball;
    private _death_zones: DeathZone[];
    private _last_death_zone_player_id: number;

    private _players_life: Map<number, number>;

    public constructor(lobby: Lobby, settings: GameSettings){
        this._lobby = lobby;
        this._settings = settings;
        this._status = GameStatus.WAITING;
        this._players = new Map();
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

    public start(){
        if (this._status != GameStatus.WAITING) return;
        this._status = GameStatus.STARTING;

        //initialize the game objects
        this.initObjects();

        //send the init package to all players
        this._players.forEach(player => {
            this.sendInitPackage(player.connectionHandler);
        });

        //start the game loop
        this.gameLoop();

        //start the first round
        this.startRound();

        console.log(`[+] Game ${this.__id} started!`);
    }

    public connectPlayer(connectionHandler: ConnectionHandler): any{
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
    }

    private onPlayerConnect(){
        if (this._players.size == this._settings.player_count){
            this.start();
        }
    }

    private async startRound(){

        console.log(`[+] Starting round in game ${this.__id} ...`);

        //set the game's status to IN_ROUND_BREAK
        this._status = GameStatus.IN_ROUND_BREAK;

        //set the ball's position to the center of the terrain and make it fixed
        this._ball.spawn();
        this._ball.fixed = true;

        //fix the players' positions
        this._players.forEach(player => {
            player.tpToSpawn();
            player.fixed = true;
        });

        //wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

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
     * Called when a player looses a point
     */
    private async onScore(playerId){
        //todo: update life points
        console.log(`[+] Player ${playerId} lost a life in game ${this.__id}!`);

        this.sendScorePackage();

        this.startRound();
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

        //check collisions between players and ball
        this._players.forEach(player => {
            if (aabbCollision(player, this._ball)){
                let to_invert: 'x' | 'y' = 'x';

                if (player.localId == 0) to_invert = 'y';
                else if (player.localId == 1) to_invert = 'y';
                else if (player.localId == 2) to_invert = 'x';
                else if (player.localId == 3) to_invert = 'x';

                this._ball.onCollision(to_invert);
                console.log(`[+] ball collision with ${player.name} !`)
                collided = true;
                return;
            }
        });

        return collided;
    }
    private checkDeathZone(): boolean{
        let player_id: number = -1;

        //check if the ball is in a death zone
        this._death_zones.forEach(death_zone => {
            if (aabbCollision(death_zone, this._ball)){
                player_id = death_zone.playerId;
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

        if (this._settings.player_count == 2) {
            if (ball_position.x < 0){
                this._ball.onCollision('x');
                return false;
            }
            else if (ball_position.x > EngineConfig.TERRAIN_MATRIX_SIZE.x - this._ball.width){
                this._ball.onCollision('x');
                return false;
            }

            return ball_position.y < 0 || ball_position.y > EngineConfig.TERRAIN_MATRIX_SIZE.y - this._ball.height;
        }
        else if (this._settings.player_count == 3){
            if (ball_position.x > EngineConfig.TERRAIN_MATRIX_SIZE.x - this._ball.width){
                this._ball.onCollision('x');
                return false;
            }

            return ball_position.x < 0 
                || ball_position.y < 0 
                || ball_position.y > EngineConfig.TERRAIN_MATRIX_SIZE.y - this._ball.height;
        }
        
        return ball_position.x < 0 
                || ball_position.x > EngineConfig.TERRAIN_MATRIX_SIZE.x - this._ball.width
                || ball_position.y < 0 
                || ball_position.y > EngineConfig.TERRAIN_MATRIX_SIZE.y - this._ball.height;
    }


    //#region Initialization

    private initObjects(){
        this.initPlayers();
        this.initBall();
        this.initDeathZones();
    }
    private initPlayers(){
        const player_count = this._settings.player_count;
        this._player_local_id = new Map();
        this._players_life = new Map();
        let local_id = 0;

        //initialize players
        this._players.forEach(player => {
            this._player_local_id.set(local_id, player.id);
            this._players_life.set(player.id, this._settings.player_life);

            player.localId = local_id;
            player.fixed = false;
            player.color = EngineConfig.PLAYER_COLORS[player_count][local_id];
            player.spawnPosition = EngineConfig.PLAYER_SPAWN_POSITIONS[player_count][local_id];
            player.movementType = EngineConfig.PLAYER_MOVEMENT_TYPES[player_count][local_id];
            player.position = player.spawnPosition;

            //set the player size
            //if the player moves horizontally, the size is the default size
            //if the player moves vertically, the size is inverted (width becomes height and vice-versa)
            player.size = player.movementType == PlayerMovementType.Horizontal ? this._settings.player_size : {
                width: this._settings.player_size.height,
                height: this._settings.player_size.width
            };

            player.fixed = true;
            player.init();
            local_id++;
        });
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

        this._players.forEach(player => {
            const pos : Position = {
                x: player.spawnPosition.x,
                y: player.spawnPosition.y
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
        });
    }

    //#endregion

    

    //#region Game packages handling

    //#region Server -> Client

    private sendInitPackage(connectionHandler: ConnectionHandler){
        const players = [];
        let local_id = 0;

        //get the players' positions
        this._players.forEach(player => {
            const player_data = {
                user_id: player.id,
                local_id: local_id,
                position: {
                    x: player.x,
                    y: player.y,
                },
                size: {
                    width: player.width,
                    height: player.height
                },
                color: player.color,
                isClient: player.connectionHandler.connection_data.user.userId == connectionHandler.connection_data.user.userId,
                movement_type: player.movementType
            };

            players.push(player_data);
            local_id++;
        });

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
        this._players.forEach(player => {
            const player_data = {
                id: player.id,
                life: this._players_life.get(player.id),
            };

            players_score.push(player_data);
        });

        const pack: ScorePackage = {
            scores: players_score
        };

        this._lobby.sendMessageToAllConnections(Messages.GAME_SCORE, pack);
    }
    private sendRoundStartPackage(){
        this._lobby.sendMessageToAllConnections(Messages.GAME_ROUND_START, {});
    }
    private sendUpdatePackage(){
        const players_pos = [];

        //get the players' positions
        this._players.forEach(player => {
            const player_data = {
                id: player.id,
                x: player.x,
                y: player.y,
            };

            players_pos.push(player_data);
        });

        const ball = {
            x: this._ball.x,
            y: this._ball.y,
        };
        
        const pos = {
            players: players_pos,
            ball: ball
        };

        const pack: UpdatePackage = {
            positions: pos
        };

        this._lobby.sendMessageToAllConnections(Messages.GAME_UPDATE, pack);
    }

    //#endregion

    //#region Client -> Server

    private bindMessages(connectionHandler: ConnectionHandler){
        const socket = connectionHandler.socket;
    }

    //#endregion

    //#endregion

    
}