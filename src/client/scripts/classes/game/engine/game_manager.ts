import * as PIXI from "pixi.js"
import GameObject from "./game_object.js";

export default class GameManager{
    private static _instance: GameManager = null;
    private _gameObjects: GameObject[] = [];
    private _scene: PIXI.Container;

    public static get instance(): GameManager{
        if (GameManager._instance == null)
            throw new Error("GameManager is not initialized");

        return GameManager._instance;
    }

    public static get scene(): PIXI.Container{
        return GameManager.instance._scene;
    }


    public addGameObject(gameObject: GameObject){
        this._gameObjects.push(gameObject);
    }

    public static init(scene: PIXI.Container){
        GameManager._instance = new GameManager();
        GameManager._instance._scene = scene;
    }


}