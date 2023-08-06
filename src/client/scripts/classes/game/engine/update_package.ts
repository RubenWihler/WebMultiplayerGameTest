export default class UpdatePackage{
    public readonly positions: {
        players: { 
            [id: string]: {
                x: number,
                y: number,
                rotation: number,
            },
        },
        ball: { 
            x: number, 
            y: number, 
            rotation: number 
        }
    };

}

export class InputPackage{
    public readonly move_left: boolean;
    public readonly move_right: boolean;

    constructor(move_left: boolean, move_right: boolean){
        this.move_left = move_left;
        this.move_right = move_right;
    }
}