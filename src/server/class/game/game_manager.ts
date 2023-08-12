import GameSettings from "./game_settings.js";
import Game from "./game.js";
import Lobby from "../lobby/lobby.js";

export default class GameManager {
    private static _instance: GameManager;

    private _games: Map<string, Game>;

    public static get instance(): GameManager{
        if (!GameManager._instance){
            GameManager.init();
        }

        return GameManager._instance;
    }

    public static init(): GameManager{
        GameManager._instance = new GameManager();
        return GameManager._instance;
    }

    private constructor(){
        this._games = new Map<string, Game>();
    }

    public getGame(game_id: string): Game{
        return this._games.get(game_id);
    }

    public createGame(lobby: Lobby, settings: GameSettings): Game{
        console.log(`[+] Creating game with id ${lobby.id}...`);
        const id = lobby.id;

        //be sure that the game with the same id doesn't already exists
        if (this._games.has(id)){
            console.warn(`[!] A game with the same id (${id}) already exists ! Cannot create game !`);
            return null;
        };
        
        const game = new Game(lobby, settings);
        this._games.set(id, game);

        return game;
    }

    public deleteGame(game_id: string): boolean{
        const game = this._games.get(game_id);
        if (!game) return false;
        game.delete();
        this._games.delete(game_id);
        return true;
    }

}