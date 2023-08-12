export default interface UpdatePackage {
    positions: {
        /**
         * Key: player id (user id)
         */
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