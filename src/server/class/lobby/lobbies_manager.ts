import ObservableEvent from "../event_system/observable_event.js";
import IdGenerator from "../global_types/id_generator.js";
import Lobby from "./lobby.js";

/**
 * Class that manages lobbies.
 */
export default class LobbiesManager{
    private static _instance: LobbiesManager;
    private readonly _lobbies: Map<string, Lobby>;

    public static readonly onLobbyCreated = new ObservableEvent<Lobby>();
    public static readonly onLobbyDeleted = new ObservableEvent<void>();

    public static get instance(): LobbiesManager {
        if (!LobbiesManager._instance) {
            LobbiesManager._instance = new LobbiesManager();
        }

        return LobbiesManager._instance;
    }

    public static get lobbies(): Lobby[]{
        return Array.from(LobbiesManager.instance._lobbies.values());
    }

    public static get lobbiesData(): any[]{
        const datas = [];

        this.lobbies.forEach(lobby => {
            datas.push({
                id: lobby.id,
                name: lobby.name,
                players_count: lobby.player_count,
                max_players: lobby.max_players,
                using_password: lobby.using_password,
            });
        });

        return datas;
    }

    private constructor() {
        LobbiesManager._instance = this;
        this._lobbies = new Map<string, Lobby>();
    }

    /**
     * Creates new lobby and adds it to the list of lobbies.
     * @param name the name of the lobby
     * @returns the created lobby
     */
    public static createLobby(name: string, password: string = null): Lobby {
        const id = LobbiesManager.generateId();
        const lobby = new Lobby(id, name, password);
        
        LobbiesManager.instance._lobbies.set(id, lobby);
        
        return lobby;
    }
    /**
     * Force all the lobby's connections to disconnect and removes it from the list of lobbies.
     * @param id the id of the lobby to delete
     * @returns if the lobby was deleted successfully
     */
    public static deleteLobby(id: string): boolean {
        if (!LobbiesManager.instance._lobbies.has(id)) {
            return false;
        }

        const lobby = LobbiesManager.instance._lobbies.get(id);
        lobby.delete();
        LobbiesManager.instance._lobbies.delete(id);
        LobbiesManager.onLobbyDeleted.notify();
        return true;
    }
    /**
     * finds lobby by id and returns it.
     * @param id the id of the lobby
     * @returns the lobby with the given id
     */
    public static getLobby(id: string): Lobby {
        return LobbiesManager.instance._lobbies.get(id);
    }

    /**
     * Generates random id.
     * @returns 
     */
    private static generateId(): string {
        let id: string;

        do id = IdGenerator.generate();
        while (LobbiesManager.instance._lobbies.has(id));

        return IdGenerator.generate();
    }
}