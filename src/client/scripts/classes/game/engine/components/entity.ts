import Component from "../component.js";

export default abstract class Entity extends Component {

    public setTransform(x: number, y: number): void {
        this.gameObject.position = { x, y };
    }

}