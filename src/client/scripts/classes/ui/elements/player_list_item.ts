import ObservableEvent from "../../global_types/observable_event.js";

export default class PlayerListItem {
    private _element: HTMLElement;
    private _id: number;
    private _name: string;
    private _haveOwnerPrivilege: boolean;
    private _isClient: boolean;
    private _status: string;
    private _ownerId: number;

    public readonly onKick: ObservableEvent<number>;
    public readonly onBan: ObservableEvent<number>;
    public readonly onPromote: ObservableEvent<number>;

    /**
     * Return the HTML element of the player list item.
     */
    public get element(): HTMLElement {
        return this._element;
    }

    constructor(id: number, name: string, status: string, isClient: boolean, haveOwnerPrivilege: boolean, ownerId: number) {
        this._id = id;
        this._name = name;
        this._status = status;
        this._isClient = isClient;
        this._ownerId = ownerId;
        this._haveOwnerPrivilege = haveOwnerPrivilege;
        this.onPromote = new ObservableEvent<number>();
        this.onKick = new ObservableEvent<number>();
        this.onBan = new ObservableEvent<number>();
        this._element = this.createHTMLElement();
    }

    /**
     * Dispose the observables events.
     */
    public dispose(){
        this.onKick.dispose();
        this.onBan.dispose();
    }

    private createHTMLElement(): HTMLElement {
        /* 
        HTML structure :
        
        <div class="lobby-player-item glass-card">
            <span class="lobby-player-name">1 player1</span>
            <span class="lobby-player-status">ready</span>
            <div>
                <button class="lobby-player-kick-button fill-button"><i class="fas fa-sign-out-alt"></i></button>
                <button class="lobby-player-ban-button fill-button"><i class="fas fa-ban"></i></button>
            </div>
        </div>
        */

        //main div
        const element = document.createElement('div');
        element.classList.add('lobby-player-item', 'glass-card');

        //span containing the name
        const name = document.createElement('span');
        name.classList.add('lobby-player-name');
        
        if (this._ownerId === this._id) 
            name.innerHTML = `<i class="fas fa-crown"></i> ${this._name}`;
        else 
            name.innerText = this._name;

        if (this._isClient) name.classList.add('current-client');

        //span containing the status
        const status = document.createElement('span');
        status.classList.add('lobby-player-status');
        status.innerText = 
            this._status === 'LOBBY_READY'     ? 'ready' :
            this._status === 'LOBBY_NOT_READY' ? 'not ready' :
            this._status;

        element.appendChild(name);
        element.appendChild(status);

        //check that the current logged client is the owner of the lobby
        //and that the current player is not the client
        if (this._haveOwnerPrivilege && !this._isClient){
            const buttons_container = this.createOwnerButtons();
            element.appendChild(buttons_container);
        }

        return element;
    }
    /**
     * Create the ban and kick buttons which are only visible for the owner of the lobby.
     * @returns a div containing the buttons.
     */
    private createOwnerButtons(): HTMLElement {
        const buttons_container = document.createElement('div');
        
        //promote button
        const promote_button = document.createElement('button');
        promote_button.classList.add('lobby-player-promote-button', 'fill-button');
        promote_button.innerHTML = '<i class="fas fa-crown"></i>';
        promote_button.addEventListener('click', () => {
            this.onPromote.notify(this._id);
        });

        //kick button
        const kick_button = document.createElement('button');
        kick_button.classList.add('lobby-player-kick-button', 'fill-button');
        kick_button.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
        kick_button.addEventListener('click', () => {
            this.onKick.notify(this._id);
        });

        //ban button
        const ban_button = document.createElement('button');
        ban_button.classList.add('lobby-player-ban-button', 'fill-button');
        ban_button.innerHTML = '<i class="fas fa-ban"></i>';
        ban_button.addEventListener('click', () => {
            this.onBan.notify(this._id);
        });

        buttons_container.appendChild(promote_button);
        buttons_container.appendChild(kick_button);
        buttons_container.appendChild(ban_button);

        return buttons_container;
    }
}