import EngineConfig from "../../engine_config.js";
import Vector2, { randomVector2 } from "../../types/Vector2.js";
import Size from "../../types/size.js";
import Entity from "./entity.js";


export default class Ball extends Entity{
    protected _real_speed: number;
    protected _speed: number;
    protected _direction: Vector2;
    protected _speed_increase_cooldown: number = 0;

    public get direction(): Vector2 {
        return this._direction;
    }

    public set direction(value: Vector2) {
        this._direction = value;
    }

    constructor(spawnPosition: Vector2, size: Size, speed: number){
        super("ball", spawnPosition, size);
        this._speed = speed;
        this._real_speed = speed;
        this._direction = {x: 0, y: 0};
    }

    public init(): void {
    }
    public update(): void {
        this.move(this._direction);
        if (this._speed_increase_cooldown > 0){
            //reduce the cooldown by 0.01 per frame
            this._speed_increase_cooldown -= 0.01;
        }
    }
    public destroy(): void {
    }

    public spawn(): void {
        this._real_speed = this._speed;
        this._position = {x: 400, y: 400};

        do { this._direction = randomVector2(); }
        while (Math.abs(this._direction.y) < 0.2 || Math.abs(this._direction.y) > 0.8);
    }

    public onCollision(toInverse: 'x' | 'y'): void {
        this._direction = toInverse == 'x' ? {
            x: this._direction.x * -1,
            y: this._direction.y
        } : {
            x: this._direction.x,
            y: this._direction.y * -1
        };

        if (this._speed_increase_cooldown < 0.01 && this._speed_increase_cooldown > -0.01){
            this._real_speed += EngineConfig.BALL_SPEED_INCREASE_PER_COLLISION;
            this._speed_increase_cooldown = EngineConfig.BALL_SPEED_INCREASE_COOLDOWN;
        }
    }

    protected move(direction: Vector2){
        const x = this.x + direction.x * this._real_speed;
        const y = this.y + direction.y * this._real_speed;

        this._position = {x: x, y: y};
    }
}