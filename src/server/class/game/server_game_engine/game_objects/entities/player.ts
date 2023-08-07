import EngineConfig from "../../engine_config.js";
import Vector2, { distance, squaredDistance } from "../../types/Vector2.js";
import Direction from "../../types/direction.js";
import Position from "../../types/position.js";
import Size from "../../types/size.js";
import { TransformData } from "../../types/transform.js";
import Entity from "./entity.js";

export default class Player extends Entity{
    protected _max_positions: {left: Vector2, right: Vector2};
    protected _speed: number;
    
    constructor(spawnPosition: Position, spawnRotation: number, size: Size, speed: number, _max_positions: {left: Vector2, right: Vector2}){
        super("player", {position: spawnPosition, rotation: spawnRotation}, size);
        this._speed = speed;
        this._max_positions = _max_positions;
    }

    public init(): void {
    }
    public start(): void {
        super.start();
    }
    public update(): void {
    }
    public destroy(): void {
    }

    protected onTransformChange(data: TransformData): boolean {
        return super.onTransformChange(data) &&
            this.checkIfOutOfBoundaries(data.position);
    }
    protected onFixedChange(newFixedValue: boolean): boolean {
        return true;
    }
    protected onSizeChange(newSize: Size): void {}

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