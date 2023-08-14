import Component from "../component.js";

export default abstract class Entity extends Component {
    protected _fixed: boolean = false;

    public get fixed(): boolean {
        return this._fixed;
    }
    public set fixed(value: boolean) {
        this._fixed = value;
    }

    public get position(): { x: number, y: number } {
        //if fixed, return a frozen object to prevent modification
        if (this._fixed) return Object.freeze(this.gameObject.position);
        return this.gameObject.position;
    }

    public setTransform(x: number, y: number): void {
        //if fixed, do nothing
        if (this._fixed) return;
        this.gameObject.position = { x, y };
    }

}