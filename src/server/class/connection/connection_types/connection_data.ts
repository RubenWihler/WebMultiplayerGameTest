import User from "./user.js";

export default class ConnectionData {
    token: string;
    user: User;

    constructor(token: string, user: User) {
        this.token = token;
        this.user = user;
    }
}