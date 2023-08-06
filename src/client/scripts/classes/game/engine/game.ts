import * as PIXI from "pixi.js"
import GameObject from "./game_object.js";
import GameSettings from "../game_settings.js";
import UpdatePackage from "./update_package.js";
import Player from "./components/player.js";
import Position from "./position.js";
import Ball from "./components/ball.js";
import InputManager from "./components/input_manager.js";


export default class Game{
    private _running: boolean = false;
    private _settings: GameSettings;
    private _app: PIXI.Application;
    private _scene: PIXI.Container;
    private _terrain: PIXI.Container;
    private _gameObjects: GameObject[];
    private _players: Player[];
    private _ball: Ball;
    private _inputManager: InputManager;



    constructor(app: PIXI.Application, settings: GameSettings){
        this._settings = settings;
        this._app = app;
        this._scene = null;
        this._terrain = null;
        this._gameObjects = [];

        this.create();
    }

    public getObjectByName(name: string): GameObject{
        return this._gameObjects.find(obj => obj.name == name);
    } 

    public addGameObject(gameObject: GameObject): boolean{
        this._gameObjects.push(gameObject);
        return true;
    }


    public networkUpdate(updatePackage: UpdatePackage){
        for (const player of this._players){
            const player_data = updatePackage.positions.players[player.id];
            player.setTransform(player_data.x, player_data.y, player_data.rotation);
        }
    }

    public update(){
        for (const obj of this._gameObjects){
            obj.update();
        }
    }

    public destroy(){
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
    }

    private start(){
        this._running = true;
        this._app.ticker.add(this.update, this);
    }  

    private create(){
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
        terrain.interactive = true;
        terrain.interactiveChildren = true;

        terrain.width = 900;
        terrain.height = 900;

        terrain.x = this._app.screen.width / 2;
        terrain.y = this._app.screen.height / 2;

        terrain.pivot.x = terrain.width / 2;
        terrain.pivot.y = terrain.height / 2;
        
        return terrain;
    }
    private createPlayers(){
        this._players = [];

        for (const player_data of this._settings.player_datas){
            // player component
            const player_component = new Player(
                player_data.id,
                player_data.name, 
                player_data.color, 
                player_data.is_local
            );

            //player game object
            const player_go = new GameObject(
                new Position(0, 0),
                [player_component],
                `player_${player_data.id}`,
                0
            );

            this._players.push(player_component);
        }
    }
    private createBall(){
        const ball_component = new Ball(0xFFFFFF);

        const ball_go = new GameObject(
            new Position(0, 0),
            [ball_component],
            "ball",
            0
        );

        this._ball = ball_component;
    }
    private createInputManager(): void{
        const input_manager_component = new InputManager();
        const input_manager_go = new GameObject(
            new Position(0, 0),
            [input_manager_component],
            "input_manager",
            0
        );

        this._inputManager = input_manager_component;
    }

}