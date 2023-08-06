import Entity from "./entity.js";
import Sprite from "./sprite.js";
import Color from "../color.js";
import Texture from "../textures.js";
import GameObject from "../game_object.js";

export default class Player extends Entity {
    public readonly id: number;
    public readonly name: string;
    public readonly color: Color;
    public readonly isLocal: boolean;
    private _sprite: Sprite;
    

    constructor(id: number, name: string, color: number, isLocal: boolean) {
        super();
        this.id = id;
        this.name = name;
        this.color = color;
        this.isLocal = isLocal;

    }

    public setTransform(x: number, y: number, rotation: number): void {
        x -= this._sprite.width / 2;
        y -= this._sprite.height / 2;
        this.gameObject.position = { x, y };
        this.gameObject.rotation = rotation;
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
            100,
            25
        );

        const sprite_renderer = sprite.sprite;
        sprite_renderer.tint = this.color;

        return sprite;
    }
}