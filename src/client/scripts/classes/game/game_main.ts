import * as PIXI from "pixi.js"
import GameSettings from "./game_settings.js";
import GameManager from "./engine/game_manager.js";
import GameObject from "./engine/game_object.js";
import Position from "./engine/position.js";
import Sprite from "./engine/components/sprite.js";


/**
 * Called 1 time when the game is loaded
 */
export function init(settings: GameSettings) : HTMLCanvasElement{
    

    GameManager.init(app.stage);

    return app.view as HTMLCanvasElement;
}

/**
 * Called every time the game is started
 */
export function start(){
    console.log("Game started");

    const sp_test = new GameObject( new Position(100, 100), [
            new Sprite(PIXI.Texture.from("https://pixijs.com/assets/bunny.png"), 400, 400)
        ], "test"
    );
    GameManager.instance.addGameObject(sp_test);

    setInterval(() => {
        sp_test.rotation += 0.01;
        
        const new_pos = sp_test.position;
        new_pos.x = Math.sin(sp_test.rotation) * 100 + 100;
        new_pos.y = Math.cos(sp_test.rotation) * 100 + 100;
        sp_test.position = new_pos;
    }, 10);
}