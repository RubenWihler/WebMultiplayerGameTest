import GameSettings from "../../game_settings.js"

export default interface GameInitPackage{
    players: Array<{
        user_id: number,
        local_id: number,
        position: {
            x: number,
            y: number
        },
        color: number,
        isClient: boolean
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