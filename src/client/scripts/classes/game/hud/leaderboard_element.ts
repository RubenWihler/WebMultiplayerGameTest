export default class LeaderboardElement{
    public readonly place: number;
    public readonly name: string;

    private _element: HTMLDivElement;
    private _place_element: HTMLSpanElement;
    private _name_element: HTMLSpanElement;

    constructor(place: number, name: string, parent: HTMLDivElement){
        this.place = place;
        this.name = name;

        this._element = document.createElement("div");
        this._element.classList.add("leaderboard-item");
        this._element.classList.add("glass-card");

        this._place_element = document.createElement("span");
        this._place_element.classList.add("leaderboard-item-place");
        this._place_element.innerText = `${place.toString()}.`;

        this._name_element = document.createElement("span");
        this._name_element.classList.add("leaderboard-item-name");
        this._name_element.innerText = name.toString();

        this._element.appendChild(this._place_element);
        this._element.appendChild(this._name_element);

        parent.appendChild(this._element);
    }
}