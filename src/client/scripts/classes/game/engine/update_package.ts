export default interface UpdatePackage{
    positions: {
        players: Array< {
            id: number,
            x: number,
            y: number,
        }>,
        ball: { 
            x: number, 
            y: number, 
        }
    };
}

export class InputPackage{
    public readonly move_left: boolean;
    public readonly move_right: boolean;
    public readonly move_up: boolean;
    public readonly move_down: boolean;

    constructor(move_left: boolean, move_right: boolean, move_up: boolean, move_down: boolean){
        this.move_left = move_left;
        this.move_right = move_right;
        this.move_up = move_up;
        this.move_down = move_down;
    }
}