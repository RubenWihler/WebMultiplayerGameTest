import ObservableEvent from "../../global_types/observable_event.js";
import ScoreElement from "./score_element.js";

/**
 * Class that manage all hud elements
 */
export default class HUDManager{
    private _spectating: boolean;

    private _hud_container: HTMLDivElement;
    private _score_container: HTMLDivElement;
    private _element_spectate: HTMLSpanElement;
    private _leave_button: HTMLButtonElement;

    private _scores_elements: Array<ScoreElement> = [];

    public readonly onLeaveClick: ObservableEvent<void>;
    
    public get spectating(): boolean{
        return this._spectating;
    }
    public set spectating(value: boolean){
        this._spectating = value;
        this.updateSpectate(value);
    }

    constructor(){
        this.onLeaveButtonClick = this.onLeaveButtonClick.bind(this);

        this.onLeaveClick = new ObservableEvent<void>();

        this._hud_container = document.querySelector("#hud-container");
        this._score_container = document.querySelector("#hud-scores-items");
        this._element_spectate = document.querySelector("#hud-spectate");
        this._leave_button = document.querySelector("#hud-leave-button");

        this.spectating = false;
    }

    /**
     * Display all hud elements
     */
    public display(){
        this.displayElement(this._hud_container, true);

        //add event listener of buttons
        this._leave_button.addEventListener("click", this.onLeaveButtonClick);
    }

    /**
     * Hide all hud elements
     */
    public hide(){
        this.displayElement(this._hud_container, false);

        //remove event listener of buttons
        this._leave_button.removeEventListener("click", this.onLeaveButtonClick);
    }

    //#region Scores

    public updateScore(score: Array<{id: number, name: string, life: number}>, clientId: number){
        this._score_container.innerHTML = "";
        this._scores_elements = [];

        score.forEach((element) => {
            this._scores_elements.push(
                new ScoreElement(
                    { name: element.name, life: element.life },
                    element.id === clientId,
                    this._score_container
                )
            );
        });
    }

    //#endregion

    //#region Spectate

    /**
     * Show or hide spectate element
     * @param spectating if has to show or hide spectate element
     */
    private updateSpectate(spectating: boolean){
        this.displayElement(this._element_spectate, spectating);
    }

    //#endregion

    //#region Buttons

    private onLeaveButtonClick = () => {
        this.onLeaveClick.notify();
    }

    //#endregion

    //#region utils

    /**
     * Display or hide element
     * @param element the element to display or hide
     * @param value if has to display or hide element
     */
    private displayElement(element: HTMLElement, value: boolean){
        if(value){
            element.style.display = "flex";
            element.style.visibility = "visible";
        }else{
            element.style.display = "none";
            element.style.visibility = "hidden";
        }
    }

    //#endregion
}