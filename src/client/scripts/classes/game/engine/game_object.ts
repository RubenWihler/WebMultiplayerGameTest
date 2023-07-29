import IComponent from "./component.js";
import Position from "./position.js";
import GameManager from "./game_manager.js";
import ObservableEvent from "../../global_types/observable_event.js";

export default class GameObject{
    /**
     * Position of the game object
     */
    private _position: Position;
    /**
     * Rotation in radians
     */
    private _rotation: number;
    /**
     * Name of the game object
     */
    public name: string;
    /**
     * Components of the game object
     */
    public components: IComponent[];

    /**
     * Event called when the rotation of the game object is changed
     */
    public readonly onRotationChanged: ObservableEvent<number> = new ObservableEvent<number>();
    /**
     * Event called when the position of the game object is changed
     */
    public readonly onPositionChanged: ObservableEvent<Position> = new ObservableEvent<Position>();

    constructor(position: Position, components: IComponent[] = [], name: string = "GameObject", rotation: number = 0){
        GameManager.instance.addGameObject(this);
        
        this._position = position;
        this.name = name;
        this._rotation = rotation;

        this.components = [];

        components.forEach(component => {
            this.addComponent(component);
        });
    }

    /**
     * Position of the game object
     */
    public get position(){
        return this._position;
    }
    /**
     * Position of the game object
     */
    public set position(position: Position){
        this._position = position;
        this.onPositionChanged.notify(position);
    }

    /**
     * Rotation in radians
     */
    public get rotation(){
        return this._rotation;
    }
    /**
     * Rotation in radians
     */
    public set rotation(rotation: number){
        this._rotation = rotation;
        this.onRotationChanged.notify(rotation);
    }

    /**
     * Scene where the game object is
     */
    public get scene(){
        return GameManager.scene;
    }

    /**
     * Add a component to the game object
     * @param component Component to add to the game object
     */
    public addComponent(component: IComponent){
        this.components.push(component);
        component.attach(this);
        component.start();
    }

    /**
     * Remove all component from the game object by comparing the type of the component with constructor.name
     * @param componentType Type of the component to remove
     */
    public removeComponent(componentType: string){
        const component_to_remove: IComponent[] = this.components.filter((c: IComponent) => c.constructor.name == componentType);

        component_to_remove.forEach(component => {
            component.destroy();
            this.components.splice(this.components.indexOf(component), 1);
        });
    }

    /**
     * Return the first component of the game object that match the type of the component
     * @param compenentType the name of the type of the component (constructor.name)
     * @returns the first component of the game object that match the type of the component or undefind if no component match
     */
    public getComponent(compenentType: string): IComponent{
        return this.components.filter((c: IComponent) => c.constructor.name == compenentType)[0];
    }

    /**
     * Update all components of the game object
     */
    public update(){
        this.components.forEach(component => {
            component.update();
        });
    }

    /**
     * Destroy all components of the game object
     */
    public destroy(){
        this.components.forEach(component => {
            component.destroy();
        });
    }
}