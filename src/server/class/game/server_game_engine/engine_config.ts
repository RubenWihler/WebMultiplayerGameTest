export default class EngineConfig{
    static readonly MAX_PLAYERS = 8;
    static readonly MIN_PLAYERS = 2;

    static readonly FPS = 60;

    static readonly TERRAIN_MATRIX_SIZE = {
        x: 800,
        y: 800
    };

    static readonly DEFAULT_PLAYER_SIZE = {
        width: 100,
        height: 25
    };

    static readonly DEFAULT_BALL_SIZE = {
        width: 20,
        height: 20
    };

    static readonly DEFAULT_PLAYER_SPEED = 5;
    static readonly DEFAULT_BALL_SPEED = 5;
    static readonly WALL_SIZE = {
        width: 80,
        height: EngineConfig.TERRAIN_MATRIX_SIZE.y - 400
    };

    static readonly DEATH_ZONE_SIZE_HEIGHT = 100;
}