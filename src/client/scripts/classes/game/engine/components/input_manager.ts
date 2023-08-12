import ObservableEvent from "../../../global_types/observable_event.js";
import Component from "../component.js";
import { InputPackage } from "../update_package.js";

export default class InputManager extends Component {
    public readonly onInputPackage: ObservableEvent<InputPackage>;
    private _inputMap: Map<string, boolean> = null;
    private _listeningKeyboard: boolean = false;
    
    private get inputPackage(): InputPackage {
        let moving_left = false;
        let moving_right = false;
        let moving_up = false;
        let moving_down = false;
        
        if (this._inputMap.get("move_left")) moving_left = true;
        if (this._inputMap.get("move_right")) moving_right = true;
        if (this._inputMap.get("move_up")) moving_up = true;
        if (this._inputMap.get("move_down")) moving_down = true;

        // If both keys are pressed, stop moving
        if ((moving_left && moving_right) || (moving_up && moving_down)){
            moving_left = false;
            moving_right = false;
            moving_up = false;
            moving_down = false;
        }

        return new InputPackage(
            moving_left,
            moving_right,
            moving_up,
            moving_down
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
        this.onInputPackage = new ObservableEvent<InputPackage>();
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

    private onInputChanged(): void {
        this.onInputPackage.notify(this.inputPackage);
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        if (!this._listeningKeyboard) return;

        if (event.key == "ArrowLeft" || event.key == "a" || event.key == "q"){
            this._inputMap.set("move_left", true);
            this.onInputChanged();
        }
        else if (event.key == "ArrowRight" || event.key == "d"){
            this._inputMap.set("move_right", true);
            this.onInputChanged();
        }
        else if (event.key == "ArrowUp" || event.key == "w" || event.key == "z"){
            this._inputMap.set("move_up", true);
            this.onInputChanged();
        }
        else if (event.key == "ArrowDown" || event.key == "s"){
            this._inputMap.set("move_down", true);
            this.onInputChanged();
        }
    }
    private onKeyUp = (event: KeyboardEvent): void => {
        if (event.key == "ArrowLeft" || event.key == "a" || event.key == "q"){
            this._inputMap.set("move_left", false);
            this.onInputChanged();
        }
        else if (event.key == "ArrowRight" || event.key == "d"){
            this._inputMap.set("move_right", false);
            this.onInputChanged();
        }
        else if (event.key == "ArrowUp" || event.key == "w" || event.key == "z"){
            this._inputMap.set("move_up", false);
            this.onInputChanged();
        }
        else if (event.key == "ArrowDown" || event.key == "s"){
            this._inputMap.set("move_down", false);
            this.onInputChanged();
        }
    }
    private onBlurred = (): void => {
        this._inputMap.set("move_left", false);
        this._inputMap.set("move_right", false);
        this._inputMap.set("move_up", false);
        this._inputMap.set("move_down", false);
        this.onInputChanged();
    }

    private bindInputEvents(): void {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        window.addEventListener("blur", this.onBlurred);
    }
    private unbindInputEvents(): void {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
        window.removeEventListener("blur", this.onBlurred);
    }
}