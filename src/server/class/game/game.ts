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
import Wall from "./server_game_engine/game_objects/entities/wall.js";
import UpdatePackage from "./server_game_engine/packages/update_package.js";
import { distance } from "./server_game_engine/types/Vector2.js";
import { checkCollision } from "./server_game_engine/types/collision.js";
import { Paths } from "./server_game_engine/types/player_path.js";

export default class Game {
    private _lobby: Lobby;
    private _settings: GameSettings;
    private _status: GameStatus;

    private _players: Map<number, Player>;
    private _player_local_id: Map<number, number>;
    private _ball: Ball;
    private _walls: Wall[];
    private _death_zones: DeathZone[];
    private _last_death_zone_player_id: number;

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

    public start(){
        if (this._status != GameStatus.WAITING) return;
        this._status = GameStatus.STARTING;

        this.initObjects();

        //start the game loop
        this.gameLoop();
    }

    public connectPlayer(connectionHandler: ConnectionHandler): any{
        if (this._status != GameStatus.WAITING) return {
            success: false,
            messages: ["GAME_ALREADY_STARTED"]
        };

        const player = new Player(
            connectionHandler, 
            {x: 500, y: 700},//temp 
            0,//temp 
            this._settings.player_size, 
            this._settings.player_speed, 
            {
                left: {x: 200, y: 700},//temp
                right: {x: 700, y: 700}//temp
            }
        );

        const id = connectionHandler.connection_data.user.userId;
        this._players.set(id, player);
        this.onPlayerConnect();
    }

    private onPlayerConnect(){
        if (this._players.size == this._settings.player_count){
            this.start();
        }
    }

    private async startRound(){
        //set the game's status to IN_ROUND_BREAK
        this._status = GameStatus.IN_ROUND_BREAK;

        //set the ball's position to the center of the terrain and make it fixed
        this._ball.fixed = true;
        this._ball.spawn();

        //fix the players' positions
        this._players.forEach(player => {
            player.fixed = true;
        });

        //wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

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
        this.startRound();
    }

    private async gameLoop(){
        while (this._status != GameStatus.ENDING){
            this.update();
            await new Promise(resolve => setTimeout(resolve, 1000 / EngineConfig.FPS));
        }
    }

    private update(){
        if (this._status != GameStatus.RUNNING) return;

        this._players.forEach(player => {
            player.update();
        });
        this._ball.update();
        if (!this.checkCollisions()){
            //check if the ball is in a death zone
            if (!this.checkDeathZone()){
                //check if the ball is out of bounds
                if (this.checkOutOfBounds()){
                    this.onScore(this._last_death_zone_player_id);
                }
            }
        }

        this.sendUpdatePackage();
    }

    private checkCollisions(): boolean{
        let collided = false;

        //check collisions between players and ball
        this._players.forEach(player => {
            const collision = checkCollision(player, this._ball);
            if (collision.collided){
                this._ball.onCollision(player, collision.collision_position);
                collided = true;
                return;
            }
        });

        //if the ball collided with a player, don't check for collisions with walls
        if (collided) return true;

        //check collisions between walls and ball
        this._walls.forEach(wall => {
            const collision = checkCollision(wall, this._ball);
            if (collision.collided){
                this._ball.onCollision(wall, collision.collision_position);
                collided = true;
                return;
            }
        });

        return collided;
    }
    private checkDeathZone(): boolean{
        const ball_position = this._ball.position;
        let player_id: number = -1;

        //check if the ball is in a death zone
        this._death_zones.forEach(death_zone => {
            if (checkCollision(death_zone, this._ball)){
                player_id = death_zone.playerId;
                return;
            }
        });

        //if the ball is not in a death zone, return false
        if (player_id == -1) return false;

        this._last_death_zone_player_id = player_id;
        return true;
    }
    private checkOutOfBounds(): boolean{
        const ball_position = this._ball.position;

        return ball_position.x > 0 && ball_position.x < EngineConfig.TERRAIN_MATRIX_SIZE.x && 
            ball_position.y > 0 && ball_position.y < EngineConfig.TERRAIN_MATRIX_SIZE.y;
    }


    //#region Initialization

    private initObjects(){
        this.initPlayers();
        this.initBall();
        this.initWalls();
        this.initDeathZones();
    }
    private initPlayers(){
        this._player_local_id = new Map();
        let local_id = 0;
        let player_index = 0;

        //initialize the players' local ids
        this._players.forEach(player => {
            this._player_local_id.set(local_id, player.id);
            local_id++;
        });

        //initialize the players' max positions + rotations and initialize them
        Paths[this._settings.player_count].paths.forEach(paths => {
            const player = this._players.get(this._player_local_id.get(player_index));

            const left_position = paths.left_position;
            const right_position = paths.right_position;

            const rotation = Math.atan2(
                right_position.y - left_position.y,
                right_position.x - left_position.x
            );

            player.max_positions = {
                left: left_position,
                right: right_position
            };

            player.transform.rotation = rotation;
            player.init();
        });
    }
    private initBall(){
        const ball = new Ball(
            {
                x: EngineConfig.TERRAIN_MATRIX_SIZE.x / 2,
                y:EngineConfig.TERRAIN_MATRIX_SIZE.y / 2
            },
            0,
            this._settings.ball_size,
            this._settings.ball_speed
        );

        ball.init();
        this._ball = ball;
    }
    private initWalls(){
        const center_x = EngineConfig.TERRAIN_MATRIX_SIZE.x / 2;
        const center_y = EngineConfig.TERRAIN_MATRIX_SIZE.y / 2;

        this._walls = [];

        switch (this._settings.player_count) {
            case 2:
                const wall1 = new Wall(
                    {
                        x: EngineConfig.WALL_SIZE.width / 2,
                        y: center_y
                    },
                    0,
                    EngineConfig.WALL_SIZE
                );
                const wall2 = new Wall(
                    {
                        x: EngineConfig.TERRAIN_MATRIX_SIZE.x - EngineConfig.WALL_SIZE.width / 2,
                        y: center_y
                    },
                    0,
                    EngineConfig.WALL_SIZE
                );

                this._walls.push(wall1);
                this._walls.push(wall2);
                break;
        
            default:
                break;
        }
    }
    private initDeathZones(){
        this._death_zones = [];

        Paths[this._settings.player_count].paths.forEach(paths => {

            //width is the distance between the left and right positions
            const width = distance(paths.left_position, paths.right_position);
            const height = EngineConfig.DEATH_ZONE_SIZE_HEIGHT;

            //calculate the center of the death zone
            const center_x = (paths.left_position.x + paths.right_position.x) / 2;
            const center_y = (paths.left_position.y + paths.right_position.y) / 2;

            // Calculate the angle of rotation in radians
            const rotation = Math.atan2(
                paths.right_position.y - paths.left_position.y,
                 paths.right_position.x - paths.left_position.x
            );

            const death_zone = new DeathZone(
                {
                    x: center_x,
                    y: center_y
                },
                rotation,
                {
                    width: width,
                    height: height
                }
            );

            this._death_zones.push(death_zone);
        });


        //assign a player to each death zone and initialize it
        let player_index = 0;

        this._death_zones.forEach(deathZone => {
            deathZone.playerId = this._player_local_id[player_index];
            player_index++;

            deathZone.init();
        });
    }

    //#endregion

    private bindMessages(connectionHandler: ConnectionHandler){
        const socket = connectionHandler.socket;
    }

    private sendUpdatePackage(){
        const players = {};

        //get the players' positions
        this._players.forEach(player => {
            const player_data = {
                x: player.x,
                y: player.y,
                rotation: player.rotation
            };

            players[player.id] = player_data;
        });

        const ball = {
            x: this._ball.x,
            y: this._ball.y,
            rotation: this._ball.rotation
        };

        
        const positions = {
            players: players,
            ball: ball
        };
        

        const pack: UpdatePackage = {
            positions: positions
        };

        this._lobby.sendMessageToAllConnections(Messages.GAME_UPDATE, pack);
    }
}