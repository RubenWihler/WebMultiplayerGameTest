import * as PIXI from "pixi.js"
import Component from "../component.js";

export default class Sprite extends Component {
    private _sprite: PIXI.Sprite;
    private _texture: PIXI.Texture;
    private _width: number;
    private _height: number;

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
        this._sprite.position.set(this.gameObject.position.x, this.gameObject.position.y);
        this.gameObject.scene.addChild(this._sprite);
    }
    update(): void {
    }
    destroy(): void {
    }

    public move(x: number, y: number){
        this._sprite.position.set(x, y);
    }

    private initEvents(){
        this.gameObject.onPositionChanged.subscribe((position) => {
            this._sprite.position.set(position.x, position.y);
        });
        this.gameObject.onRotationChanged.subscribe((rotation) => {
            this._sprite.rotation = rotation;
        });
    }
}