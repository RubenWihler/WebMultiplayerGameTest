import Component from "../component.js";
import { InputPackage } from "../update_package.js";

export default class InputManager extends Component {
    private _inputMap: Map<string, boolean> = null;
    private _listeningKeyboard: boolean = false;
    
    public get inputPackage(): InputPackage {
        let moving_left = false;
        let moving_right = false;
        
        if (this._inputMap.get("move_left")) moving_left = true;
        if (this._inputMap.get("move_right")) moving_right = true;

        // If both keys are pressed, stop moving
        if (moving_left && moving_right){
            moving_left = false;
            moving_right = false;
        }

        return new InputPackage(
            moving_left,
            moving_right
        );
    }

    public get listeningKeyboard(): boolean{
        return this._listeningKeyboard;
    }

    public set listeningKeyboard(value: boolean){
        this._listeningKeyboard = value;
    }

    constructor(){
        super();

        this._inputMap = new Map<string, boolean>();
        this.bindInputEvents();
    }

    public start(): void {
        this._listeningKeyboard = true;
    }
    public update(): void {
        
    }
    public destroy(): void {
        this.unbindInputEvents();
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        if (!this._listeningKeyboard) return;

        if (event.key == "ArrowLeft" || event.key == "a"){
            this._inputMap.set("move_left", true);
        }
        else if (event.key == "ArrowRight" || event.key == "d"){
            this._inputMap.set("move_right", true);
        }
    }
    private onKeyUp = (event: KeyboardEvent): void => {
        if (event.key == "ArrowLeft" || event.key == "a"){
            this._inputMap.set("move_left", false);
        }
        else if (event.key == "ArrowRight" || event.key == "d"){
            this._inputMap.set("move_right", false);
        }
    }

    private bindInputEvents(): void {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }
    private unbindInputEvents(): void {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
    }

}