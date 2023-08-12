export default class GameSettings {
    public player_datas: PlayerData[];
    public ball_position: {x: number, y: number};
    public map_name: string;

    public ball_speed: number;
    public ball_size: number;
    public ball_color: number;
    public player_speed: number;

    constructor(playerDatas: PlayerData[],ballPosition: {x: number, y: number}, map_name: string, ball_speed: number, ball_size: number, ball_color: number, player_speed: number) {
        this.player_datas = playerDatas;
        this.ball_position = ballPosition;
        this.map_name = map_name;
        this.ball_speed = ball_speed;
        this.ball_size = ball_size;
        this.ball_color = ball_color;
        this.player_speed = player_speed;
    }
}

export class PlayerData {
    public id: number;
    public local_id: number;
    public name: string;
    public color: number;
    public is_local: boolean;
    public position: {x: number, y: number};

    constructor(id: number, localId: number, name: string, color: number, is_local: boolean, position: {x: number, y: number}) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.is_local = is_local;
        this.position = position;
    }
}