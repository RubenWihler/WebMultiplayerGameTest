export default class GameSettings {
    public player_count: number;
    public map_name: string;

    public ball_speed: number;
    public ball_size: number;
    public ball_color: string;
    public player_speed: number;

    constructor(player_count: number, map_name: string, ball_speed: number, ball_size: number, ball_color: string, player_speed: number) {
        this.player_count = player_count;
        this.map_name = map_name;
        this.ball_speed = ball_speed;
        this.ball_size = ball_size;
        this.ball_color = ball_color;
        this.player_speed = player_speed;
    }
}