import Position from "./position";

export default interface PlayerPath {
    left_position: Position;
    right_position: Position;
}


export const Paths = {
    2: {
        paths: [
            {
                left_position:  { x: 0, y: 700 },
                right_position: { x: 800, y: 700 }
            },
            {
                left_position:  { x: 0, y: 100 },
                right_position: { x: 800, y: 100 }
            }
        ]
    },
} as const;