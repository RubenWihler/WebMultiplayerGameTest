import Position from "./position.js";

/**
 * An object containing the position and the rotation of a transform
 */
export interface TransformData{
    /**
     * The position of the transform (x and y)
     */
    position: Position;
    /**
     * The rotation of the transform in radians
     */
    rotation: number;
}

/**
 * A class representing a transform (position and rotation)
 */
export default class Transform {
    private _position: Position;
    private _rotation: number;

    /**
     * Event called when the transform changes (position or rotation)
     */
    public readonly onChange: (data: TransformData) => boolean;

    public constructor(position: Position = {x: 0, y: 0}, rotation: number = 0, onChange: (data: TransformData) => boolean = (data: TransformData) => true){
        this._position = position;
        this._rotation = rotation;
        this.onChange = onChange;
    }

    /**
     * Returns the data of the transform (position and rotation)
     * @returns an object containing the position and the rotation
     */
    public get data(): TransformData{
        return {
            position: this._position,
            rotation: this._rotation
        }
    }

    /**
     * Returns the position of the transform
     */
    public get position(): Position{
        return this._position;
    }

    /**
     * Returns the rotation of the transform in radians
     */
    public get rotation(): number{
        return this._rotation;
    }

    /**
     * Sets the data of the transform (position and rotation)
     * @param data an object containing the position and the rotation
     */
    public set data(data: TransformData){
        if (!this.onChanges(data)) return;
        this._position = data.position;
        this._rotation = data.rotation;
    }

    /**
     * Sets the position of the transform
     */
    public set position(position: Position){
        if (!this.onChanges({
            position: position,
            rotation: this._rotation
        })) return;

        this._position = position;
    }

    /**
     * Sets the rotation of the transform in radians
     */
    public set rotation(rotation: number){
        if (!this.onChanges({
            position: {
                x: this._position.x,
                y: this._position.y
            },
            rotation: rotation
        })) return;
        
        this._rotation = rotation;
    }

    /**
     * Sets the x of the position of the transform
     */
    public set x(x: number){
        if (!this.onChanges({
            position: {
                x: x,
                y: this._position.y
            },
            rotation: this._rotation
        })) return;
        
        this._position.x = x;
    }

    /**
     * Sets the y of the position of the transform
     */
    public set y(y: number){
        if (!this.onChanges({
            position: {
                x: this._position.x,
                y: y
            },
            rotation: this._rotation
        })) return;

        this._position.y = y;
    }

    /**
     * Notify the changes of the transform
     */
    private onChanges(data: TransformData): boolean{
        return this.onChange(data);
    }
}