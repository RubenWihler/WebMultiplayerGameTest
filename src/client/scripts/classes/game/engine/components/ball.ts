import Entity from "./entity.js";
import Sprite from "./sprite.js";
import Texture from "../textures.js";
import GameObject from "../game_object.js";

export default class Ball extends Entity {

    private _sprite: Sprite;
    private _color: number = 0xFFFFFF;
    private _size: {width: number, height: number};

    constructor(color: number, size: {width: number, height: number}) {
        super();
        this._color = color;
        this._size = size;
    }

    public setTransform(x: number, y: number): void {
        // x -= this._sprite.width / 2;
        // y -= this._sprite.height / 2;
        this.gameObject.position = { x, y };
    }

    public attach(gameObject: GameObject): void {
        super.attach(gameObject);
        this.initComponents();
    }
    
    public start(): void {
    }

    public update(): void {
    }

    public destroy(): void {
    }

    

    private initComponents(): void {
        this._sprite = this.createSprite();
        this.gameObject.addComponent(this._sprite);
    }

    private createSprite(): Sprite {
        const sprite = new Sprite(
            Texture.white,
            this._size.width,
            this._size.height
        );

        const sprite_renderer = sprite.sprite;
        sprite_renderer.tint = this._color;

        return sprite;
    }
}