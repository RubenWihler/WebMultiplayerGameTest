import Entity from "./entity.js";
import Sprite from "./sprite.js";
import Texture from "../textures.js";
import GameObject from "../game_object.js";

export default class Ball extends Entity {

    private _sprite: Sprite;
    private _color: number = 0xFFFFFF;

    constructor(color: number) {
        super();

        this._color = color;
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
            35,
            35
        );

        const sprite_renderer = sprite.sprite;
        sprite_renderer.tint = this._color;

        return sprite;
    }
}