import UpdatePackage, { InputPackage, ScorePackage } from "../game/engine/update_package.js";
import ConnectionManager from "./connection_manager.js";
import ObservableEvent from "../global_types/observable_event.js";


export default class GameConnectionManager {
    private static _instance: GameConnectionManager = null;

    public readonly onGameNetworkUpdate: ObservableEvent<UpdatePackage>;
    public readonly onScore: ObservableEvent<ScorePackage>;
    public readonly onRoundStart: ObservableEvent<void>;

    public static get instance(): GameConnectionManager {
        if (this._instance == null) {
            new GameConnectionManager();
        }

        return this._instance;
    }

    constructor() {
        GameConnectionManager._instance = this;
        this.onGameNetworkUpdate = new ObservableEvent<UpdatePackage>();
        this.onScore = new ObservableEvent<ScorePackage>();
        this.onRoundStart = new ObservableEvent<void>();
        this.bindMessages();
    }



    public static sendInputPackage(inputPackage: InputPackage): void {
        ConnectionManager.send("game-client-inputs", inputPackage);
    }

    private bindMessages() {
        // Game update
        ConnectionManager.on("game-update", (updatePackage: UpdatePackage) => {
            this.onGameNetworkUpdate.notify(updatePackage);
        });

        // Score
        ConnectionManager.on("game-score", (scorePackage: ScorePackage) => {
            this.onScore.notify(scorePackage);
        });

        // Round start
        ConnectionManager.on("game-round-start", () => {
            this.onRoundStart.notify();
        });
    }
}

