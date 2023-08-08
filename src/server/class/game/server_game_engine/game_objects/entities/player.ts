import ConnectionHandler from "../../../../connection/connection_handler.js";
import PlayerInputManager from "../../managers/player_input_manager.js";
import Vector2, { squaredDistance } from "../../types/Vector2.js";
import Direction from "../../types/direction.js";
import Position from "../../types/position.js";
import Size from "../../types/size.js";
import { TransformData } from "../../types/transform.js";
import Entity from "./entity.js";

export default class Player extends Entity{
    protected _connectionHandler: ConnectionHandler;
    protected _max_positions: {left: Vector2, right: Vector2};
    protected _speed: number;
    protected _input_manager: PlayerInputManager;

    public get id(): number {
        return this._connectionHandler.connection_data.user.userId;
    }

    public get max_positions(): {left: Vector2, right: Vector2} {
        return this._max_positions;
    }
    public set max_positions(value: {left: Vector2, right: Vector2}) {
        this._max_positions = value;
    }
    
    constructor(connectionHandler: ConnectionHandler, spawnPosition: Position, spawnRotation: number, size: Size, speed: number, _max_positions: {left: Vector2, right: Vector2}){
        super("player", {position: spawnPosition, rotation: spawnRotation}, size);
        this._speed = speed;
        this._max_positions = _max_positions;
        this._connectionHandler = connectionHandler;
    }

    public init(): void {
        this._input_manager = new PlayerInputManager(this._connectionHandler);
    }
    public start(): void {
        super.start();
    }
    public update(): void {
        this.tryMove(this._input_manager.movingDirection);
    }
    public destroy(): void {
        this._input_manager.destroy();
    }

    protected onTransformChange(data: TransformData): boolean {
        return super.onTransformChange(data) &&
            this.checkIfOutOfBoundaries(data.position);
    }
    protected onFixedChange(newFixedValue: boolean): boolean {
        return true;
    }
    protected onSizeChange(newSize: Size): void {}

    protected tryMove(direction: Direction){
        if (direction == Direction.NONE) return;
        this.move(direction);
    }
    protected move(direction: Direction){
        const current_pos = this.position;

        // Calculate the displacement along the x and y axes
        const delta_x = this._speed * Math.cos(this.rotation) * direction;
        const delta_y = this._speed * Math.sin(this.rotation) * direction;

        // Calculate the new x and y positions
        const new_x = current_pos.x + delta_x;
        const new_y = current_pos.y + delta_y;

        // Update the position
        this.transform.position = {x: new_x, y: new_y};
    }
    private checkIfOutOfBoundaries(position: Position): boolean{
        return squaredDistance(position, this._max_positions.left) > Math.pow(Math.max(this.width, this.height) + 5, 2) ||
            squaredDistance(position, this._max_positions.right) > Math.pow(Math.max(this.width, this.height) + 5, 2);
    }
}