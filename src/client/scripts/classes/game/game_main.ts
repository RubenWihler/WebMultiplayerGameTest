import GameSettings from "./game_settings.js";
import GameManager from "./engine/game_manager.js";
import Game from "./engine/game.js";



/**
 * Called 1 time when the game is loaded
 */
export function init() : HTMLCanvasElement{
    GameManager.init();
    return GameManager.app.view as HTMLCanvasElement;
}

/**
 * Called every time the game is started
 */
export function start(settings: GameSettings) : Game{
    console.log("Game started");
    return GameManager.newGame(settings);
}