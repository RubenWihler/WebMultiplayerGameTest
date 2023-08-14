import Entity from "./entity.js";
import Sprite from "./sprite.js";
import Color from "../color.js";
import Texture from "../textures.js";
import GameObject from "../game_object.js";

export default class Player extends Entity {
    public readonly id: number;
    public readonly local_id: number;
    public readonly name: string;
    public readonly color: Color;
    public readonly isLocal: boolean;
    /**
     * 0: horizontal
     * 1: vertical
     */
    public readonly movement_type: number;
    private _sprite: Sprite;
    private _size: {width: number, height: number};
    
    public get size(): {width: number, height: number} {
        return this._size;
    }

    constructor(id: number, localId: number, name: string, color: number, isLocal: boolean, size: {width: number, height: number}, movement_type: number) {
        super();
        this.id = id;
        this.local_id = localId;
        this.name = name;
        this.color = color;
        this.isLocal = isLocal;
        this._size = size;
        this.movement_type = movement_type;
    }

    public setTransform(x: number, y: number): void {
        super.setTransform(x, y);
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
        sprite_renderer.tint = this.color;

        return sprite;
    }
}