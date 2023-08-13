import * as PIXI from "pixi.js"
import GameObject from "./game_object.js";
import GameSettings from "../game_settings.js";
import UpdatePackage from "./update_package.js";
import Player from "./components/player.js";
import Position from "./position.js";
import Ball from "./components/ball.js";
import InputManager from "./components/input_manager.js";
import GameConnectionManager from "../../connection/game_connection_manager.js";
import ConnectionManager from "../../connection/connection_manager.js";


export default class Game{
    private _running: boolean = false;
    private _settings: GameSettings;
    private _app: PIXI.Application;
    private _scene: PIXI.Container;
    private _terrain: PIXI.Container;
    private _gameObjects: GameObject[];
    private _players: Map<number, Player>;
    private _ball: Ball;
    private _inputManager: InputManager;

    public get terrain(): PIXI.Container{
        return this._terrain;
    }

    constructor(app: PIXI.Application, settings: GameSettings){
        this._settings = settings;
        this._app = app;
        this._scene = null;
        this._terrain = null;
        this._gameObjects = [];
    }

    public getObjectByName(name: string): GameObject{
        return this._gameObjects.find(obj => obj.name == name);
    } 

    public addGameObject(gameObject: GameObject): boolean{
        this._gameObjects.push(gameObject);
        return true;
    }


    public networkUpdate(updatePackage: UpdatePackage){
        // Update players
        for (const player_pos of updatePackage.positions.players){
            this._players.get(player_pos.id).setTransform(
                player_pos.x,
                player_pos.y,
            );
        }

        // Update ball
        const ball_data = updatePackage.positions.ball;
        this._ball.setTransform(
            ball_data.x, 
            ball_data.y, 
        );
    }

    public update(){
        for (const obj of this._gameObjects){
            obj.update();
        }
    }

    public destroy(){
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

    private start(){
        this._running = true;
        this._app.ticker.add(this.update, this);
        this._app.ticker.start();

        //bind resize event
        window.addEventListener("resize", this.onResize.bind(this));

        // subscribe to network messages
        GameConnectionManager.instance.onGameNetworkUpdate.subscribe((data) => this.networkUpdate(data));
    }

    public create(){
        this._scene = this.createScene();
        this._terrain = this.createTerrain();
        this._scene.addChild(this._terrain);
        this.createPlayers();
        this.createBall();
        this.createInputManager();
        this.start();
    }

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
                player_data.size
            );

            //player game object
            const player_go = new GameObject(
                new Position(player_data.position.x, player_data.position.y),
                [player_component],
                `player_${player_data.id}`,
            );

            console.log(player_data.position);

            this._players.set(player_data.id, player_component);
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
        const input_manager_component = new InputManager();
        const input_manager_go = new GameObject(
            new Position(0, 0),
            [input_manager_component],
            "input_manager",
        );

        // Send input package to server when input changes
        input_manager_component.onInputPackage.subscribe((input_package) => {
            GameConnectionManager.sendInputPackage(input_package);
        });

        this._inputManager = input_manager_component;
    }

    private onResize = (): void => {
        this._app.renderer.resize(window.innerWidth, window.innerHeight);
        this._terrain.x = this._app.screen.width / 2 - 400;
        this._terrain.y = this._app.screen.height / 2 - 400;
    }
}