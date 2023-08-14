import PlayerMovementType from "./types/player_movement_type.js";

export default class EngineConfig{
    static readonly MAX_PLAYERS = 4;
    static readonly MIN_PLAYERS = 2;

    static readonly FPS = 60;

    static readonly TERRAIN_MATRIX_SIZE = {
        x: 800,
        y: 800
    };

    static readonly DEFAULT_PLAYER_SIZE = {
        width: 100,
        height: 15
    };

    static readonly DEFAULT_BALL_SIZE = {
        width: 20,
        height: 20
    };

    static readonly DEFAULT_PLAYER_SPEED = 10;
    static readonly DEFAULT_BALL_SPEED = 5;

    static readonly BALL_SPEED_INCREASE_PER_COLLISION = 0.3;
    static readonly BALL_SPEED_INCREASE_COOLDOWN = 0.1;

    static readonly WALL_SIZE = {
        width: 10,
        height: 10
    };

    static readonly DEATH_ZONE_THICKNESS = 100;

    static readonly PLAYER_COLORS = {
        2: [
            0xFF7963,
            0x874DFF,
        ],
        3: [
            0xFF4DD0,
            0x63E9FF,
            0x4DFF7C
        ],
        4: [
            0xFF4D6A,
            0x63E9FF,
            0x4DFF7C,
            0x874DFF
        ]
    }

    static readonly PLAYER_SPAWN_POSITION_OFFSET = 50;

    static readonly PLAYER_SPAWN_POSITIONS = {
        2: [
            {
                x: EngineConfig.TERRAIN_MATRIX_SIZE.x / 2 - EngineConfig.DEFAULT_PLAYER_SIZE.width / 2,
                y: EngineConfig.PLAYER_SPAWN_POSITION_OFFSET - EngineConfig.DEFAULT_PLAYER_SIZE.height / 2
            },
            {
                x: EngineConfig.TERRAIN_MATRIX_SIZE.x / 2 - EngineConfig.DEFAULT_PLAYER_SIZE.width / 2,
                y: EngineConfig.TERRAIN_MATRIX_SIZE.y - EngineConfig.PLAYER_SPAWN_POSITION_OFFSET - EngineConfig.DEFAULT_PLAYER_SIZE.height / 2
            }
        ],
        3: [
            {
                x: EngineConfig.TERRAIN_MATRIX_SIZE.x / 2 - EngineConfig.DEFAULT_PLAYER_SIZE.width / 2,
                y: EngineConfig.PLAYER_SPAWN_POSITION_OFFSET - EngineConfig.DEFAULT_PLAYER_SIZE.height / 2
            },
            {
                x: EngineConfig.TERRAIN_MATRIX_SIZE.x / 2 - EngineConfig.DEFAULT_PLAYER_SIZE.width / 2,
                y: EngineConfig.TERRAIN_MATRIX_SIZE.y - EngineConfig.PLAYER_SPAWN_POSITION_OFFSET - EngineConfig.DEFAULT_PLAYER_SIZE.height / 2
            },
            {
                x: EngineConfig.PLAYER_SPAWN_POSITION_OFFSET - EngineConfig.DEFAULT_PLAYER_SIZE.height / 2,
                y: EngineConfig.TERRAIN_MATRIX_SIZE.y / 2 - EngineConfig.DEFAULT_PLAYER_SIZE.width / 2
            }
        ],
        4: [
            {
                x: EngineConfig.TERRAIN_MATRIX_SIZE.x / 2 - EngineConfig.DEFAULT_PLAYER_SIZE.width / 2,
                y: EngineConfig.PLAYER_SPAWN_POSITION_OFFSET - EngineConfig.DEFAULT_PLAYER_SIZE.height / 2
            },
            {
                x: EngineConfig.TERRAIN_MATRIX_SIZE.x / 2 - EngineConfig.DEFAULT_PLAYER_SIZE.width / 2,
                y: EngineConfig.TERRAIN_MATRIX_SIZE.y - EngineConfig.PLAYER_SPAWN_POSITION_OFFSET - EngineConfig.DEFAULT_PLAYER_SIZE.height / 2
            },
            {
                x: EngineConfig.PLAYER_SPAWN_POSITION_OFFSET - EngineConfig.DEFAULT_PLAYER_SIZE.height / 2,
                y: EngineConfig.TERRAIN_MATRIX_SIZE.y / 2 - EngineConfig.DEFAULT_PLAYER_SIZE.width / 2
            },
            {
                x: EngineConfig.TERRAIN_MATRIX_SIZE.x - EngineConfig.PLAYER_SPAWN_POSITION_OFFSET - EngineConfig.DEFAULT_PLAYER_SIZE.height / 2,
                y: EngineConfig.TERRAIN_MATRIX_SIZE.y / 2 - EngineConfig.DEFAULT_PLAYER_SIZE.width / 2
            }
        ],
    }
    
    static readonly PLAYER_MOVEMENT_TYPES = {
        2: [
            PlayerMovementType.Horizontal,
            PlayerMovementType.Horizontal
        ],
        3: [
            PlayerMovementType.Horizontal,
            PlayerMovementType.Horizontal,
            PlayerMovementType.Vertical
        ],
        4: [
            PlayerMovementType.Horizontal,
            PlayerMovementType.Horizontal,
            PlayerMovementType.Vertical,
            PlayerMovementType.Vertical
        ],
    }
}