import * as PIXI from "pixi.js"
import Component from "../component.js";
import Sprite from "./sprite.js";
import Color from "../color.js";

export default class Player extends Component {
    public readonly id: number;
    public readonly name: string;
    public readonly color: Color;
    public readonly isLocal: boolean;
    private _sprite: Sprite;
    private _inputMap: Map<string, boolean> = null;

    constructor(id: number, name: string, color: number, isLocal: boolean) {
        super();
        this.id = id;
        this.name = name;
        this.color = color;
        this.isLocal = isLocal;

        this.initComponents();
        if (this.isLocal){
            this._inputMap = new Map<string, boolean>();
            this.bindInputEvents();
        }
    }

    public setTransform(x: number, y: number, rotation: number): void {
        this.gameObject.position = { x, y };
        this.gameObject.rotation = rotation;
    }

    public start(): void {
    }
    public update(): void {
        if (!this.isLocal) return;
        const input_package = this.getInputPackage();
    }
    public destroy(): void {
        window.removeEventListener("keydown", null);
        window.removeEventListener("keyup", null);
    }


    private initComponents(): void {
        this._sprite = this.createSprite();
        this.gameObject.addComponent(this._sprite);
    }
    private createSprite(): Sprite {
        const sprite = new Sprite(
            PIXI.Texture.WHITE,
            200,
            200
        );

        const sprite_renderer = sprite.sprite;
        sprite_renderer.tint = this.color;

        return sprite;
    }
    private bindInputEvents(): void {
        window.addEventListener("keydown", (e) => {
            if (e.key == "ArrowLeft" || e.key == "a"){
                this._inputMap.set("move_left", true);
            }
            else if (e.key == "ArrowRight" || e.key == "d"){
                this._inputMap.set("move_right", true);
            }
        });
        window.addEventListener("keyup", (e) => {
            if (e.key == "ArrowLeft" || e.key == "a"){
                this._inputMap.set("move_left", false);
            }
            else if (e.key == "ArrowRight" || e.key == "d"){
                this._inputMap.set("move_right", false);
            }
        });
    }

    private getInputPackage(): any {
        let moving_left = false;
        let moving_right = false;
        
        if (this._inputMap.get("move_left")) moving_left = true;
        if (this._inputMap.get("move_right")) moving_right = true;

        // If both keys are pressed, stop moving
        if (moving_left && moving_right){
            moving_left = false;
            moving_right = false;
        }

        return {
            move_left: moving_left,
            move_right: moving_right,
        };
    }
}