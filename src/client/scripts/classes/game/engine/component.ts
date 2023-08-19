import GameObject from "./game_object.js";

export default abstract class IComponent {
    protected _gameObject: GameObject;

    public get gameObject(): GameObject{
        return this._gameObject;
    }

    public attach(gameObject: GameObject): void{
        this._gameObject = gameObject;
    }

    public abstract start(): void;
    public abstract update(): void;
    public abstract destroy(): void;
}