export default class Messages{

    //#region CONNECTION

    public static readonly CONNECTION = "connection";
    public static readonly DISCONNECT = "disconnect";

    public static readonly SIGNUP = "signup";
    public static readonly SIGNUP_RESPONSE = "signup-response";

    public static readonly LOGIN = "login";
    public static readonly LOGIN_RESPONSE = "login-response";

    public static readonly TOKEN_LOGIN = "token_login";
    public static readonly TOKEN_LOGIN_RESPONSE = "token-login-response";

    public static readonly LOGOUT = "logout";
    public static readonly LOGOUT_RESPONSE = "logout-response";

    public static readonly DELETE_ACCOUNT = "delete-account";
    public static readonly DELETE_ACCOUNT_RESPONSE = "delete-account-response";

    public static readonly CONNECTION_ERROR = "connection-error";

    //#endregion

    //#region LOBBY

    public static readonly LOBBY_REFRESH = "lobby-refresh";
    public static readonly LOBBY_SETTINGS_CHANGED = "lobby-settings-changed";
    public static readonly LOBBY_USERS_CHANGED = "lobby-users-changed";
    public static readonly LOBBY_KICKED = "lobby-kicked";
    public static readonly LOBBY_BANNED = "lobby-banned";

    public static readonly LOBBY_LIST = "lobby-list";
    public static readonly LOBBY_LIST_RESPONSE = "lobby-list-response";

    public static readonly LOBBY_CREATE = "lobby-create";
    public static readonly LOBBY_CREATE_RESPONSE = "lobby-create-response";

    public static readonly LOBBY_JOIN = "lobby-join";
    public static readonly LOBBY_JOIN_RESPONSE = "lobby-join-response";

    public static readonly LOBBY_LEAVE = "lobby-leave";
    public static readonly LOBBY_LEAVE_RESPONSE = "lobby-leave-response";

    public static readonly LOBBY_CHANGE_NAME = "lobby-change-name";
    public static readonly LOBBY_CHANGE_NAME_RESPONSE = "lobby-change-name-response";

    public static readonly LOBBY_CHANGE_OWNER = "lobby-change-owner";
    public static readonly LOBBY_CHANGE_OWNER_RESPONSE = "lobby-change-owner-response";

    public static readonly LOBBY_BAN_USER = "lobby-ban-user";
    public static readonly LOBBY_BAN_USER_RESPONSE = "lobby-ban-user-response";

    public static readonly LOBBY_UNBAN_USER = "lobby-unban-user";
    public static readonly LOBBY_UNBAN_USER_RESPONSE = "lobby-unban-user-response";

    public static readonly LOBBY_KICK_USER = "lobby-kick-user";
    public static readonly LOBBY_KICK_USER_RESPONSE = "lobby-kick-user-response";

    public static readonly LOBBY_CHANGE_PASSWORD = "lobby-change-password";
    public static readonly LOBBY_CHANGE_PASSWORD_RESPONSE = "lobby-change-password-response";

    public static readonly LOBBY_CHANGE_MAX_PLAYERS = "lobby-change-max-player";
    public static readonly LOBBY_CHANGE_MAX_PLAYERS_RESPONSE = "lobby-change-max-players-response";

    public static readonly LOBBY_SET_READY = "lobby-set-ready";

    //#endregion

    

}
