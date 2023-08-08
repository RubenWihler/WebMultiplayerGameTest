import Vector2 from "../../types/Vector2.js";
import Size from "../../types/size.js";
import Entity from "./entity.js";


export default class Wall extends Entity{
    
    constructor(spawnPosition: Vector2, spawnRotation: number, size: Size){
        super("wall", {position: spawnPosition, rotation: spawnRotation}, size);
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