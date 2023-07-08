import ObservableEvent from "../../global_types/observable_event.js";

export default class LobbyListItem{
    public readonly name: string;
    public readonly id: string;
    public readonly players_count: number;
    public readonly max_players_count: number;
    public readonly is_private: boolean;

    public readonly onClick = new ObservableEvent<LobbyListItem>();

    private _element: HTMLElement;

    constructor(name: string, id: string, players: number, maxPlayers: number, isPrivate: boolean, parent: HTMLElement){
        this.name = name;
        this.id = id;
        this.players_count = players;
        this.max_players_count = maxPlayers;
        this.is_private = isPrivate;
        this.createElement(parent);
    }

    public delete(){
        this.onClick.dispose();
        this._element.remove();
    }

    private createElement(parent: HTMLElement): void{
        const icon = this.is_private ? 'fa-lock' : 'fa-unlock';
        const element = document.createElement('div');
        const element_name = document.createElement('span');
        const element_container = document.createElement('div');
        const element_players = document.createElement('span');
        const element_icon = document.createElement('i');

        element.addEventListener('click', () => this.onClick.notify(this));
        element.classList.add('home-join-lobby-list-item');
        element_name.innerText = this.name;
        element_players.innerText = `${this.players_count}/${this.max_players_count}`;
        element_icon.classList.add('fas', icon);

        element_container.appendChild(element_players);
        element_container.appendChild(element_icon);

        element.appendChild(element_name);
        element.appendChild(element_container);

        parent.appendChild(element);

        this._element = element;
    }
}