export default class UserData{
    userId: number;
    username: string;
    email: string;

    constructor(userId: number, username: string, email: string) {
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}