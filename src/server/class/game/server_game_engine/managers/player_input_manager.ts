import ConnectionHandler from "../../../connection/connection_handler.js";
import Messages from "../../../connection/messages.js";
import InputPackage from "../packages/input_package.js";
import Direction from "../types/direction.js";

export default class PlayerInputManager{
    public readonly connectionHandler: ConnectionHandler;
    private _moving_direction: Direction;

    public get movingDirection(): number {
        return this._moving_direction;
    }

    constructor(connectionHandler: ConnectionHandler){
        this.connectionHandler = connectionHandler;
        this._moving_direction = Direction.NONE;
    }

    public init(): void {
        this.bindMessages();
    }

    public destroy(): void {
        this.unbindMessages();
    }

    private bindMessages(): void {
        this.connectionHandler.socket.on(Messages.GAME_CLIENT_INPUTS, (data: InputPackage) => {
            
            //if the player moving left and right at the same time, the player is not moving
            if (data.move_left && data.move_right) this._moving_direction = Direction.NONE;

            //if the player is moving left
            else if (data.move_left) this._moving_direction = Direction.LEFT;

            //if the player is moving right
            else if (data.move_right) this._moving_direction = Direction.RIGHT;
        });
    }

    private unbindMessages(): void {
        if (this.connectionHandler == null || !this.connectionHandler.connected) return;

        this.connectionHandler.socket.removeAllListeners(Messages.GAME_CLIENT_INPUTS);
    }
}