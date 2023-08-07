export default interface MapSettings {
    name: string;
    background_url: string;
    ball_color: number;
    players_color: {
        2: number[];
        3: number[];
        4: number[];
        5: number[];
        6: number[];
        7: number[];
        8: number[];
    };
}