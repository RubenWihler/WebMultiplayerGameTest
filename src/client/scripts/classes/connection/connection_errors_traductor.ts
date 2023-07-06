export default class ConnectionErrorsTraductor {
    public static readonly errors: Map<string, string> = new Map<string, string>([
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
        ["OTHER_DEVICE_LOGGED_IN", "You have been disconnected because you logged in from another device.<br>It might be because you have opened the game in another tab."]
    ]);

    public static getMessage(error_code: string): string {
        if (ConnectionErrorsTraductor.errors.has(error_code)) {
            return ConnectionErrorsTraductor.errors.get(error_code) as string;
        }

        return "Unknown error";
    }
}