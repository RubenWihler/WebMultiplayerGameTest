export default class ConnectionErrorsTraductor {
    public static readonly errors: Map<string, string> = new Map<string, string>([
        ["SERVER_ERROR", "An error has occurred. Please try again later"],
        ["ALREADY_MAKING_OPERATION", "You are already making an operation. Please wait"],
        ["NOT_CONNECTED", "You are not connected to the server"],
        ["ALREADY_IN_A_LOBBY", "You are already in a lobby"],
        ["LOBBY_NAME_REQUIRED", "Lobby name is required"],
        ["LOBBY_MAX_PLAYERS_REQUIRED", "Max players is required"],
        ["USERNAME_REQUIRED", "username is required"],
        ["EMAIL_REQUIRED", "email is required"],
        ["PASSWORD_REQUIRED", "password is required"],
        ["PASSWORD_CONFIRM_REQUIRED", "password confirmation is required"],
        ["EMAIL_INVALID", "Email is invalid"],
        ["USERNAME_TOO_SHORT", "Username must be at least 3 characters long"],
        ["USERNAME_TOO_LONG", "Username must be at most 20 characters long"],
        ["PASSWORD_TOO_SHORT", "Password must be at least 5 characters long"],
        ["PASSWORDS_DO_NOT_MATCH", "Passwords confirmation does not match"],
        ["EMAIL_ALREADY_EXISTS", "Email already used"],
        ["USERNAME_ALREADY_EXISTS", "Username already exists"],
        ["ERR_CONNECTION_REFUSED", "Connection refused"],
        ["WRONG_CREDENTIALS", "Username or password incorrect"],
        ["USER_ALREADY_LOGGED_IN", "User already logged in"],
        ["USER_NOT_LOGGED_IN", "You are not logged in"],
        ["UNKNOWN_ERROR", "An unknown error has occurred. Please try again later"],
        ["OTHER_DEVICE_LOGGED_IN", "You have been disconnected because you logged in from another device.<br>It might be because you have opened the game in another tab."],
        ["USER_DOESNT_EXIST", "An error has occurred. Please try again later"],
        ["DATABASE_ERROR", "An error has occurred while connecting to the database. Please try again later"],
        ["NOT_LOGGED_IN", "An error has occurred. Please try logging in again"],
        ["LOBBY_ID_REQUIRED", "Code is required"],
        ["LOBBY_NOT_FOUND", "Lobby not found"],
        ["LOBBY_CONNECTION_ERROR", "An error occured while joining the lobby! Please try logging out and logging back in."],
        ["LOBBY_BANNED", "You have been banned from this lobby"],
        ["LOBBY_FULL", "This lobby is full"],
        ["LOBBY_PASSWORD_INCORRECT", "Incorrect password"],
        ["LOBBY_PASSWORD_REQUIRED", "Password is required"],
    ]);

    public static getMessage(error_code: string): string {
        if (ConnectionErrorsTraductor.errors.has(error_code)) {
            return ConnectionErrorsTraductor.errors.get(error_code) as string;
        }

        return "Unknown error";
    }
}