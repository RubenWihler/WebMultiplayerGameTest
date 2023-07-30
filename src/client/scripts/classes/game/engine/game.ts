import * as PIXI from "pixi.js"
import GameObject from "./game_object.js";
import GameSettings from "../game_settings.js";
import UpdatePackage from "./update_package.js";
import Player from "./components/player.js";


export default class Game{
    private _settings: GameSettings;
    private _app: PIXI.Application;
    private _scene: PIXI.Container;
    private _terrain: PIXI.Container;
    private _gameObjects: GameObject[];
    private _players: Player[];



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


    public update(updatePackage: UpdatePackage){
        for (const player of this._players){
            const player_data = updatePackage.positions.players[player.id];
            player.setTransform(player_data.x, player_data.y, player_data.rotation);
        }

    }

    public render(){

    }

    private create(){
        this._scene = this.createScene();
        this._terrain = this.createTerrain();
        this._scene.addChild(this._terrain);
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

}