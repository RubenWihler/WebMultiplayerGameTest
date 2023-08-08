import Vector2 from "../../types/Vector2.js";
import Size from "../../types/size.js";
import Entity from "./entity.js";

export default class DeathZone extends Entity {
    private _player_id: number;
    
    constructor(spawnPosition: Vector2, spawnRotation: number, size: Size){
        super("death_zone", {position: spawnPosition, rotation: spawnRotation}, size);
    }

    public get playerId(): number {
        return this._player_id;
    }
    public set playerId(value: number) {
        this._player_id = value;
    }
    

    public init(): void {
    }
    public start(): void {
        super.start();
        this.fixed = true;
    }
    public update(): void {
    }
    public destroy(): void {
    }

    protected onSizeChange(newSize: Size): void {
    }
    protected onFixedChange(newFixedValue: boolean): boolean {
        return true;
    }

}