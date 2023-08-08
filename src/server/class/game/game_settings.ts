import GameMap from "./map/map.js";
import Size from "./server_game_engine/types/size.js";

export default interface GameSettings {
    map: GameMap;
    player_count: number;
    
    player_size: Size;
    player_speed: number;

    ball_size: Size;
    ball_speed: number;

    player_life: number;

}