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