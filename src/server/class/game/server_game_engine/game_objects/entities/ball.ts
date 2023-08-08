import Vector2, { randomVector2 } from "../../types/Vector2.js";
import Position from "../../types/position.js";
import Size from "../../types/size.js";
import Entity from "./entity.js";


export default class Ball extends Entity{
    protected _speed: number;
    protected _direction: Vector2;

    public get direction(): Vector2 {
        return this._direction;
    }

    public set direction(value: Vector2) {
        this._direction = value;
    }

    constructor(spawnPosition: Vector2, spawnRotation: number, size: Size, speed: number){
        super("ball", {position: spawnPosition, rotation: spawnRotation}, size);
        this._speed = speed;
        this._direction = {x: 0, y: 0};
    }

    public init(): void {
    }
    public update(): void {
        this.move(this._direction);
    }
    public destroy(): void {
    }

    public spawn(): void {
        this.transform.position = {x: 400, y: 400};
        this._direction = randomVector2();
    }

    public onCollision(entity: Entity, collisionPosition: Position): void {
        // calculate the new direction of the ball after the collision
        const new_direction = {
            x: this._direction.x * -1,
            y: this._direction.y * -1
        };

        this.direction = new_direction;
    }

    protected onSizeChange(newSize: Size): void {
    }
    protected onFixedChange(newFixedValue: boolean): boolean {
        return true;
    }

    protected move(direction: Vector2){
        const x = this.x + direction.x * this._speed;
        const y = this.y + direction.y * this._speed;

        this.transform.position = {x: x, y: y};
    }

}