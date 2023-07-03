import UserData from "./user_data.js";

export class LoginData{
    username: string;
    password: string;

    constructor(username: string, password: string){
        this.username = username;
        this.password = password;
    }
}
export class TokenLoginData{
    username: string;
    token: string;

    constructor(username: string, token: string){
        this.username = username;
        this.token = token;
    }
}
export class SignupData{
    email: string;
    username: string;
    password: string;
    password_confirm: string;

    constructor(email: string, username: string, password: string, password_confirm: string){
        this.email = email;
        this.username = username;
        this.password = password;
        this.password_confirm = password_confirm;
    }
}

export class LoginResponseData{
    user_data: UserData;
    token: string;

    constructor(user_data: UserData, token: string){
        this.user_data = user_data;
        this.token = token;
    }
}
export class SignupResponseData{
    user_data: UserData;
    token: string;

    constructor(user_data: UserData, token: string){
        this.user_data = user_data;
        this.token = token;
    }
}