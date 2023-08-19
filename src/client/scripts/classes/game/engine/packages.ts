enum PlayerMovementType{
    Horizontal = 0,
    Vertical = 1,
}

type Size = {
    width: number,
    height: number
}

/**
 * Represents the settings of the game that are sent by the server to the client when the game starts.
 * @warning Do not confuse with GameSettings from src\client\scripts\classes\game\game_settings.ts
 */
type ServerGameSettings = {
    map: string;
    player_count: number;
    
    player_size: Size;
    player_speed: number;

    ball_size: Size;
    ball_speed: number;

    player_life: number;
}

export interface InitPackage {
    players: Array<{
        user_id: number,
        local_id: number,
        name: string,
        position: {
            x: number,
            y: number
        },
        size: Size,
        color: number,
        isClient: boolean,
        movement_type: PlayerMovementType
    }>,
    settings: ServerGameSettings,
    ball: {
        position: {
            x: number,
            y: number,
        },
        color: number
    }
}


/**
 * Represents a package that is received from the server to update the game state.
 */
export default interface UpdatePackage{
    positions: {
        players: Array< {
            id: number,
            x: number,
            y: number,
        }>,
        ball: { 
            x: number, 
            y: number, 
        }
    };
}

/**
 * Represents a package that is sent to the server to update the player's input.
 */
export class InputPackage{
    public readonly move_left: boolean;
    public readonly move_right: boolean;
    public readonly move_up: boolean;
    public readonly move_down: boolean;

    constructor(move_left: boolean, move_right: boolean, move_up: boolean, move_down: boolean){
        this.move_left = move_left;
        this.move_right = move_right;
        this.move_up = move_up;
        this.move_down = move_down;
    }
}

/**
 * Represents a package that is received from the server to update the game score.
 */
export interface ScorePackage {
    scores: Array<{id: number, life: number}>;
}

/**
 * Represents a package that is received from the server when the game ends to show the leaderboard.
 */
export interface LeaderboardPackage {
    leaderboard: Array<{id: number, place: number}>;
}

/**
 * Represents a package that is received from the server when a player is eliminated.
 */
export interface PlayerUpdatePackage{
    players: Array< {
        id: number,
        local_id: number
    }>;
}

