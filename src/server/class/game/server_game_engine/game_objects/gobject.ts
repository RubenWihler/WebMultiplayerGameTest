/**
 * A class representing a game object
 */
export default abstract class GObject{
    /**
     * The name of the game object
     */
    public readonly name: string;

    public constructor(name: string){
        this.name = name;
    }

    /**
     * Called when the game object is created
     */
    public abstract init(): void;
    /**
     * Called when the game is started or when the game object is created if the game is already started
     */
    public abstract start(): void;
    /**
     * Called when the game object is updated
     */
    public abstract update(): void;
    /**
     * Called when the game object is destroyed
     */
    public abstract destroy(): void;
}