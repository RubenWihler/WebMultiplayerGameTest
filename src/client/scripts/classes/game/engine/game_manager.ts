import * as PIXI from "pixi.js"
import Game from "./game.js";
import GameSettings from "../game_settings.js";

export default class GameManager{
    private static _instance: GameManager = null;
    private _app: PIXI.Application;
    private _currentGame: Game;

    public static get instance(): GameManager{
        if (GameManager._instance == null)
            throw new Error("GameManager is not initialized");

        return GameManager._instance;
    }

    public static get app(): PIXI.Application{
        return GameManager.instance._app;
    }

    public static get game(): Game{
        return GameManager.instance._currentGame;
    }


    
    public static init(){
        const game_manager = new GameManager();
        game_manager._app = GameManager.createApp();
        GameManager._instance = game_manager;
    }
    
    private static createApp(): PIXI.Application{
        const app = new PIXI.Application({
            background: 0x40247A,
            resizeTo: window
        });

        return app;
    }

    public static newGame(settings: GameSettings){
        const game = new Game(GameManager.app, settings);
        GameManager.instance._currentGame = game;
    }
}