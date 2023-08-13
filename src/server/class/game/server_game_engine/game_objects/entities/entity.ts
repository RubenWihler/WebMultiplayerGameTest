import Position from "../../types/position.js";
import Size from "../../types/size.js";
import GObject from "../gobject.js";

/**
 * A class representing an entity: a game object that have a position and a rotation (transform)
 */
export default abstract class Entity extends GObject{
    protected _position: Position;
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
     * position (x, y) of the entity
     */
    public get position(): Position{
        return this._position;
    }
    /**
     * position (x, y) of the entity
     */
    public set position(value: Position){
        this._position = value;
    }
    /**
     * x position of the entity
     */
    public get x(): number{
        return this._position.x;
    }
    /**
     * y position of the entity
     */
    public get y(): number{
        return this._position.y;
    }

    public constructor(name: string = "Entity", position: Position, size: Size = {width: 0, height: 0}){
        super(name);
        this._position = position;
        this._size = size;
        this._fixed = true;     
    }
    
    public start(): void {
        this._fixed = false;
    }
}