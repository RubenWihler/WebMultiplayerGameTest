import GameSettings from "../../game_settings.js"
import PlayerMovementType from "../types/player_movement_type.js"

export default interface GameInitPackage{
    players: Array<{
        user_id: number,
        local_id: number,
        position: {
            x: number,
            y: number
        },
        color: number,
        isClient: boolean,
        movement_type: PlayerMovementType
    }>,
    settings: GameSettings,
    ball: {
        position: {
            x: number,
            y: number,
        },
        color: number
    }
}