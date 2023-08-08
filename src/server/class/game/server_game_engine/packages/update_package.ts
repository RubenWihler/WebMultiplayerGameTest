export default interface UpdatePackage {
    positions: {
        players: { 
            [id: number]: {
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