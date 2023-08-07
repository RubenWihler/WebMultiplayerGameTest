import Position from "../../types/position.js";
import Size from "../../types/size.js";
import Transform, { TransformData } from "../../types/transform.js";
import GObject from "../gobject.js";

/**
 * A class representing an entity: a game object that have a position and a rotation (transform)
 */
export default abstract class Entity extends GObject{
    public readonly transform: Transform;
    protected _size: Size;
    protected _fixed: boolean;

    /**
     * Returns true if the entity is fixed (cannot move)
     */
    public get fixed(): boolean{
        return this._fixed;
    }
    /**
     * Sets the entity fixed or not (cannot move)
     */
    public set fixed(value: boolean){
        if (this._fixed == value) return;
        if (!this.onFixedChange(value)) return;
        this._fixed = value;
    }

    /**
     * Returns the size of the entity
     */
    public set size(value: Size){
        this._size = value;
    }
    /**
     * Sets the size of the entity
     */
    public get size(): Size{
        return this._size;

    }

    /**
     * Shortcut to the size width
     */
    public get width(): number{
        return this._size.width;
    }
    /**
     * Shortcut to the size width
     */
    public set width(value: number){
        this._size.width = value;
    }
    /**
     * Shortcut to the size height
     */
    public get height(): number{
        return this._size.height;
    }
    /**
     * Shortcut to the size height
     */
    public set height(value: number){
        this._size.height = value;
    }

    /**
     * Shortcut to the transform position
     */
    public get position(): Position{
        return this.transform.position;
    }
    /**
     * Shortcut to the transform rotation
     */
    public get rotation(): number{
        return this.transform.rotation;
    }
    /**
     * Shortcut to the transform x position
     */
    public get x(): number{
        return this.transform.position.x;
    }
    /**
     * Shortcut to the transform y position
     */
    public get y(): number{
        return this.transform.position.y;
    }


    public constructor(name: string = "Entity", transformData: TransformData = {position: {x: 0, y: 0}, rotation: 0}, size: Size = {width: 0, height: 0}){
        super(name);
        this.transform = new Transform(transformData.position, transformData.rotation, this.onTransformChange.bind(this));
        this._size = size;
        this._fixed = true;     
    }

    
    public start(): void {
        this._fixed = false;
    }
    
    /**
     * Called when the transform changes (position or rotation)
     * @param data the new transform data
     */
    protected onTransformChange(data: TransformData): boolean{
        return !this._fixed;
    }

    /**
     * Called when the size changes
     * @param newSize the new size
     */
    protected abstract onSizeChange(newSize: Size): void;
    /**
     * Called when the fixed would change. 
     * The return value indicates if the fixed value should change or not
     * @param newFixedValue the new fixed value
     */
    protected abstract onFixedChange(newFixedValue: boolean): boolean;
}