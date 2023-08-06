import Component from "../component.js";

export default abstract class Entity extends Component {

    public setTransform(x: number, y: number, rotation: number): void {
        this.gameObject.position = { x, y };
        this.gameObject.rotation = rotation;
    }

}