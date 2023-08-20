type Size = {
    width: number;
    height: number;
}

export class LobbyData{
    public id: string;
    public name: string;
    public using_password: boolean;
    public password: string;
    public max_players: number;
    public owner_id: number;
    public game_player_count: number;
    public game_player_size: Size;
    public game_player_speed: number;
    public game_ball_size: Size;
    public game_ball_speed: number;
    public game_player_life: number;
    public users: any[];

    constructor(id: string, name: string, using_password: boolean, password: string, max_players: number, owner_id: number, gamePlayerCount: number, gamePlayerSize: Size, gamePlayerSpeed: number, gameBallSize: Size, gameBallSpeed: number, gamePlayerLife: number, users: any[]){
        this.id = id;
        this.name = name;
        this.using_password = using_password;
        this.password = password;
        this.max_players = max_players;
        this.owner_id = owner_id;
        this.game_player_count = gamePlayerCount;
        this.game_player_size = gamePlayerSize;
        this.game_player_speed = gamePlayerSpeed;
        this.game_ball_size = gameBallSize;
        this.game_ball_speed = gameBallSpeed;
        this.game_player_life = gamePlayerLife;
        this.users = users;
    }
}