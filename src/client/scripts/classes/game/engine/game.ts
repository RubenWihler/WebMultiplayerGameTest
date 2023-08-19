import * as PIXI from "pixi.js"
import GameObject from "./game_object.js";
import GameSettings from "../game_settings.js";
import UpdatePackage, { InputPackage, PlayerUpdatePackage, ScorePackage } from "./packages.js";
import Player from "./components/player.js";
import Position from "./position.js";
import Ball from "./components/ball.js";
import InputManager from "./components/input_manager.js";
import GameConnectionManager from "../../connection/game_connection_manager.js";
import ConnectionManager from "../../connection/connection_manager.js";
import HUDManager from "../hud/hud_manager.js";
import LobbiesConnectionManager from "../../connection/lobbies_connection_manager.js";


export default class Game{
    private _running: boolean = false;
    private _spectating: boolean = false;
    private _settings: GameSettings;
    private _app: PIXI.Application;
    private _scene: PIXI.Container;
    private _terrain: PIXI.Container;
    private _gameObjects: GameObject[];
    private _players: Map<number, Player>;
    private _ball: Ball;
    private _inputManager: InputManager;
    
    private _player_lifes: Map<number, number>;
    
    //for client prediction
    private _client_player: Player;
    private _client_player_go: GameObject;
    
    //for position interpolation
    private _player_positions: Map<number, Position>;
    private _ball_position: Position;
    
    //hud manager
    private _hud_manager: HUDManager;

    public get terrain(): PIXI.Container{
        return this._terrain;
    }

    constructor(app: PIXI.Application, settings: GameSettings){
        this._settings = settings;
        this._app = app;
        this._scene = null;
        this._terrain = null;
        this._gameObjects = [];
        this._player_positions = new Map();
        this._ball_position = null;
        this._player_lifes = new Map();
        this._hud_manager = new HUDManager();
    }

    //#region Game objects management

    /**
     * Adds a game object to the game.
     * @param gameObject the game object to add
     * @returns if the game object was added successfully
     */
    public addGameObject(gameObject: GameObject): boolean{
        this._gameObjects.push(gameObject);
        return true;
    }

    //#endregion

    //#region Game Management
    
    /**
     * Starts the game loop and binds events.
     */
    private start(){
        // display hud
        this._hud_manager.display();

        this._running = true;

        //start game loop
        this._app.ticker.add(this.update, this);
        this._app.ticker.start();

        //bind resize event
        window.addEventListener("resize", this.onResize.bind(this));

        //bind hud events
        this.bindHudEvents();

        // subscribe to network messages
        GameConnectionManager.instance.onGameNetworkUpdate.subscribe((data) => this.networkUpdate(data));
        GameConnectionManager.instance.onScore.subscribe((data) => this.onScore(data));
        GameConnectionManager.instance.onRoundStart.subscribe(() => this.onRoundStart());
        GameConnectionManager.instance.onRoundEnd.subscribe(() => this.onRoundEnd());
        GameConnectionManager.instance.onPlayerUpdate.subscribe((data) => this.onPlayerUpdate(data));
    }

    /**
     * Stops the game loop unbinds events and destroys the game and all its objects.
     */
    public destroy(){
        this._hud_manager.onLeaveClick.dispose();
        this._hud_manager.hide();
        this._hud_manager = null;

        this._running = false;

        // stop game loop
        this._app.ticker.stop();

        //unsubscribe from network messages
        ConnectionManager.off("game-update");

        // unsubscribe from input package
        this._inputManager.onInputPackage.dispose();

        // destroy all game objects
        for (const obj of this._gameObjects){
            obj.destroy();
        }

        this._gameObjects = [];

        // destroy terrain
        this._terrain.destroy();
        this._terrain = null;

        // destroy scene
        this._scene.destroy();
        this._scene = null;

        this._app.destroy();
        this._app = null;

    }

    /**
     * Creates the game objects and starts the game.
     */
    public create(){
        this._scene = this.createScene();
        this._terrain = this.createTerrain();
        this._scene.addChild(this._terrain);
        this.createPlayers();
        this.createBall();
        this.createInputManager();
        this.start();
    }

    /**
     * The client game loop that is called every frame.
     */
    public update(){
        //update objects positions based on interpolation
        this.movementInterpolation();

        // update game objects
        for (const obj of this._gameObjects){
            obj.update();
        }
    }

    /**
     * Makes the client spectate the game. (no input)
     */
    public spectate(){
        this._spectating = true;

        // destroy input manager
        if (this._inputManager != null){
            this._inputManager.destroy();
            this._inputManager = null;
        }

        // set client player to null
        if (this._client_player_go != null){
            //remove client player from players map and player positions map
            this._players.delete(this._client_player.id);
            this._player_positions.delete(this._client_player.id);
            
            //destroy client player game object and set it to null
            this._client_player_go.destroy();
            this._client_player_go = null;
            this._client_player = null;
        }
        
        this.displaySpecateHud(true);
        console.log("[+] Spectating");
    }
    
    //#endregion

    //#region object creation

    private createScene(): PIXI.Container{
        return this._app.stage;
    }
    private createTerrain(): PIXI.Container{
        const terrain = new PIXI.Container();
        terrain.name = "terrain";
        terrain.zIndex = 0;
        terrain.sortableChildren = true;

        terrain.width = 800;
        terrain.height = 800;

        terrain.x = this._app.screen.width / 2 - 400;
        terrain.y = this._app.screen.height / 2 - 400;

        const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        bg.width = 800;
        bg.height = 800;
        bg.tint = 0xFFFFFF;
        bg.alpha = 0.5;
        terrain.addChild(bg);

        return terrain;
    }
    private createPlayers(){
        this._players = new Map<number, Player>();

        for (const player_data of this._settings.player_datas){
            // player component
            const player_component = new Player(
                player_data.id,
                player_data.local_id,
                player_data.name, 
                player_data.color, 
                player_data.is_local,
                player_data.size,
                player_data.movement_type
            );

            //player game object
            const player_go = new GameObject(
                new Position(player_data.position.x, player_data.position.y),
                [player_component],
                `player_${player_data.id}`,
            );

            // set client player (client player is the player that is controlled by the local user)
            if (player_data.is_local){
                this._client_player_go = player_go;
                this._client_player = player_component;
            } 

            this._players.set(player_data.id, player_component);
        }

        //if client player is null (spectating) set spectating mode
        if (this._client_player == null){
            this.spectate();
        }
    }
    private createBall(){
        const ball_component = new Ball(0xFF0000, this._settings.ball_size);
        const ball_position = this._settings.ball_position;

        const ball_go = new GameObject(
            new Position(ball_position.x, ball_position.y),
            [ball_component],
            "ball",
        );

        this._ball = ball_component;
    }
    private createInputManager(): void{
        // return if spectating
        if (this._spectating) return;

        const input_manager_component = new InputManager();
        const input_manager_go = new GameObject(
            new Position(0, 0),
            [input_manager_component],
            "input_manager",
        );

        // Send input package to server when input changes
        input_manager_component.onInputPackage.subscribe((input_package) => {
            this.clientPrediction(input_package);
            GameConnectionManager.sendInputPackage(input_package);
        });

        this._inputManager = input_manager_component;
    }

    //#endregion

    //#region movement

    /**
     * Predicts the client player position based on the input package.
     * @warning the package is not received from the server, it is created by the input manager.
     * @param inputPackage 
     */
    private clientPrediction(inputPackage: InputPackage){
        // return if spectating
        if (this._spectating) return;

        //return if player will not move
        if (!inputPackage.move_left && !inputPackage.move_right && !inputPackage.move_up && !inputPackage.move_down) return;

        let new_pos = new Position(this._client_player_go.position.x, this._client_player_go.position.y);

        // if player movement is horizontal
        if (this._client_player.movement_type == 0){
            if (inputPackage.move_left) new_pos.x -= this._settings.player_speed;
            else if (inputPackage.move_right) new_pos.x += this._settings.player_speed;
        }
        // if player movement is vertical
        else {
            if (inputPackage.move_up) new_pos.y -= this._settings.player_speed;
            else if (inputPackage.move_down) new_pos.y += this._settings.player_speed;
        }

        const x_min_pos = 0;
        const y_min_pos = 0;
        const x_max_pos = this._terrain.width - this._client_player.size.width;
        const y_max_pos = this._terrain.height - this._client_player.size.height;

        // check if new position is valid (inside terrain)
        if (new_pos.x < x_min_pos) new_pos.x = x_min_pos;
        if (new_pos.x > x_max_pos) new_pos.x = x_max_pos;
        if (new_pos.y < y_min_pos) new_pos.y = y_min_pos;
        if (new_pos.y > y_max_pos) new_pos.y = y_max_pos;

        // set new position
        this._client_player.setTransform(new_pos.x, new_pos.y);        
    }
    /**
     * Moves the players and the ball based on an interpolation of
     * the current position and the last network update position.
     */
    private movementInterpolation(){
        //player movement interpolation
        for (const player of this._players.values()){
            // skip client player
            if (!this._spectating && player.id == this._client_player.id) continue;

            const target_pos = this._player_positions.get(player.id);
            if (target_pos == undefined) continue;

            const new_pos = new Position(
                player.position.x,
                player.position.y
            );

            //interpolate position
            new_pos.x += (target_pos.x - player.position.x) * .5;
            new_pos.y += (target_pos.y - player.position.y) * .5;

            //apply new position
            player.setTransform(new_pos.x, new_pos.y);
        }

        //ball movement interpolation
        const target_pos = this._ball_position;
        if (!target_pos) return;

        const new_pos = new Position(
            this._ball.position.x,
            this._ball.position.y
        );

        //interpolate position
        new_pos.x += (target_pos.x - this._ball.position.x) * .5;
        new_pos.y += (target_pos.y - this._ball.position.y) * .5;

        //apply new position
        this._ball.setTransform(new_pos.x, new_pos.y);
    }

    //#endregion

    //#region network messages

    /**
     * This method is called when a network update is received.
     * @param updatePackage A package containing all the positions of the players and the ball.
     */
    public networkUpdate(updatePackage: UpdatePackage){
        // Update players
        for (const player_pos of updatePackage.positions.players){
            // directly update client player position without interpolation
            // because we are predicting it with input package
            if (!this._spectating && player_pos.id == this._client_player.id){
                // update client player position
                // we don't use _client_player.setTransform because..
                //  ..it force updates position even if it is fixed
                this._client_player_go.position = new Position(
                    player_pos.x,
                    player_pos.y,
                );

                continue;
            }

            // update other players positions for interpolation
            this._player_positions.set(player_pos.id, {x: player_pos.x, y: player_pos.y});
        }

        // Update ball
        const ball_data = updatePackage.positions.ball;
        this._ball_position = ball_data;
    }

    /**
     * Called when a player has lost a life.
     * @param data the score package
     */
    private onScore(data: ScorePackage){
        // update player lifes
        data.scores.forEach((score) => {
            this._player_lifes.set(score.id, score.life);
        });

        // update score text
        this.updateScoreHud();
    }

    private onRoundStart(){
        //unfixed client player position cause of input prediction
        if (this._client_player != null) this._client_player.fixed = false;
    }
    private onRoundEnd(){
        //fixed client player position cause of input prediction
        if (this._client_player != null) this._client_player.fixed = true;
    }

    private onPlayerUpdate(data: PlayerUpdatePackage){
        //remove unused players
        for (const player of this._players.values()){
            if (!data.players.find((p) => p.id == player.id)){
                this._players.delete(player.id);
                this._player_positions.delete(player.id);
                player.gameObject.destroy();
            }
        }

        //if client player is removed set spectating mode
        if (!this._spectating && !data.players.find((p) => p.id == this._client_player.id)){
            this.spectate();
        }
    }

    //#endregion

    //#region pixi events

    /**
     * Called when window is resized.
     */
    private onResize = (): void => {
        this._app.renderer.resize(window.innerWidth, window.innerHeight);
        this._terrain.x = this._app.screen.width / 2 - 400;
        this._terrain.y = this._app.screen.height / 2 - 400;
    }

    //#endregion

    //#region hud

    private bindHudEvents(){
        //bind leave button click event
        this._hud_manager.onLeaveClick.subscribe(() => {
            LobbiesConnectionManager.leaveLobby();
        });
    }

    /**
     * Updates the hud to display the spectating text.
     * @param value if the player is spectating
     */
    private displaySpecateHud(value: boolean){
        this._hud_manager.spectating = value;
    }

    /**
     * Updates the hud to display the score.
     */
    private updateScoreHud(){
        const client_id = this._spectating ? -1 : this._client_player.id;
        const scores = [];

        // create score array
        for (const score of this._player_lifes){
            const player = this._players.get(score[0]);
            if (player == undefined) continue;

            scores.push({
                id: score[0],
                name: player.name,
                life: score[1],
            });
        }

        this._hud_manager.updateScore(scores, client_id);
    }

    //#endregion

}