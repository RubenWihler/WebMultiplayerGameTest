export default class ConnectionErrorsTraductor {
    public static readonly errors: Map<string, string> = new Map<string, string>([
        ["ERR_CONNECTION_REFUSED", "Connection refused"],
        ["OTHER_DEVICE_LOGGED_IN", "You have been disconnected because you logged in from another device.<br>It might be because you have opened the game in another tab."]
    ]);

    public static getMessage(error_code: string): string {
        if (ConnectionErrorsTraductor.errors.has(error_code)) {
            return ConnectionErrorsTraductor.errors.get(error_code) as string;
        }

        return "Unknown error";
    }
}