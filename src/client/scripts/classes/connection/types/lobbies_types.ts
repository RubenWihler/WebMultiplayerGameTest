export class LobbyData{
    public id: string;
    public name: string;
    public using_password: boolean;
    public max_players: number;
    public owner_id: number;
    public users: any[];

    constructor(id: string, name: string, using_password: boolean, max_players: number, owner_id: number, users: any[]){
        this.id = id;
        this.name = name;
        this.using_password = using_password;
        this.max_players = max_players;
        this.owner_id = owner_id;
        this.users = users;
    }
}