type ScoreElementData = {name: string, life: number};

export default class ScoreElement {
    public readonly data: ScoreElementData;

    //elements
    private _element: HTMLDivElement;
    private _name: HTMLSpanElement;
    private _life: HTMLSpanElement;

    private _isClient: boolean;

    constructor(data: ScoreElementData, isClient: boolean, parent: HTMLDivElement) {
        this.data = data;
        this._isClient = isClient;
        this._element = this.createElements();
        parent.appendChild(this._element);
    }

    private createElements(): HTMLDivElement{
        const element = document.createElement("div");
        element.classList.add("hud-score-item");

        //if is client add class to element
        if(this._isClient) element.classList.add("is-client");

        this._name = document.createElement("span");
        this._name.classList.add("hud-score-item-name");
        this._name.innerText = this.data.name;

        this._life = document.createElement("span");
        this._life.classList.add("hud-score-item-value");
        this._life.innerText = this.data.life.toString();

        element.appendChild(this._name);
        element.appendChild(this._life);

        return element;
    }
}