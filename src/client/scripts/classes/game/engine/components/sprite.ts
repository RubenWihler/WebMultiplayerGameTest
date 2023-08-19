import * as PIXI from "pixi.js"
import Component from "../component.js";
import Position from "../position.js";

export default class Sprite extends Component {
    protected _sprite: PIXI.Sprite;
    protected _texture: PIXI.Texture;
    protected _width: number;
    protected _height: number;

    /**
     * Callback function that is called when the position of the sprite is changed
     * @param x the new x position of the sprite
     * @param y the new y position of the sprite
     * @returns the new position of the sprite
     */
    public onPositionChanged: (x: number, y: number) => Position = null;

    constructor(texture: PIXI.Texture, width: number, height: number) {
        super();
        this._texture = texture;
        this._width = width;
        this._height = height;
        this._sprite = new PIXI.Sprite(texture);
    }

    public get sprite(): PIXI.Sprite {
        return this._sprite;
    }

    public get texture(): PIXI.Texture {
        return this._texture;
    }
    public set texture(texture: PIXI.Texture) {
        this._texture = texture;
        this._sprite.texture = texture;
    }

    public get width(): number {
        return this._width;
    }
    public set width(width: number) {
        this._width = width;
        this._sprite.width = width;
    }

    public get height(): number {
        return this._height;
    }
    public set height(height: number) {
        this._height = height;
        this._sprite.height = height;
    }
    
    start(): void {
        this.initEvents();
        this._sprite.width = this._width;
        this._sprite.height = this._height;
        this._sprite.anchor.set(0);
        this._sprite.position.set(this._gameObject.position.x, this._gameObject.position.y);
        this._gameObject.scene.addChild(this._sprite);
    }
    update(): void {
    }
    destroy(): void {;
        this._gameObject.scene.removeChild(this._sprite);
    }

    public move(x: number, y: number){
        this._sprite.position.set(x, y);
    }

    private initEvents(){
        //if on position changed is not set, subscribe to the event normally
        if (this.onPositionChanged == null){
            this._gameObject.onPositionChanged.subscribe((position) => {
                this._sprite.position.set(position.x, position.y);
            });
        }
        //else, subscribe to the event and call the callback function
        else{
            this._gameObject.onPositionChanged.subscribe((position) => {
                position = this.onPositionChanged(position.x, position.y);
                this._sprite.position.set(position.x, position.y);
            });
        }
    }
}