export default class Messages{

    //#region CONNECTION

    public static readonly CONNECTION = "connection";
    public static readonly DISCONNECT = "disconnect";

    public static readonly SIGNUP = "signup";
    public static readonly SIGNUP_RESPONSE = "signup-response";

    public static readonly GUEST_SIGNUP = "guest-signup";
    public static readonly GUEST_SIGNUP_RESPONSE = "guest-signup-response";

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
    
    public static readonly LOBBY_JOINED = "lobby-joined";
    public static readonly LOBBY_LEFT = "lobby-left";

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

    public static readonly LOBBY_PROMOTE_USER = "lobby-promote-user";
    public static readonly LOBBY_PROMOTE_USER_RESPONSE = "lobby-promote-user-response";

    public static readonly LOBBY_CHANGE_PASSWORD = "lobby-change-password";
    public static readonly LOBBY_CHANGE_PASSWORD_RESPONSE = "lobby-change-password-response";

    public static readonly LOBBY_CHANGE_MAX_PLAYERS = "lobby-change-max-player";
    public static readonly LOBBY_CHANGE_MAX_PLAYERS_RESPONSE = "lobby-change-max-players-response";

    public static readonly LOBBY_CHANGE_GAME_PLAYER_COUNT = "lobby-change-player-count";
    public static readonly LOBBY_CHANGE_GAME_PLAYER_COUNT_RESPONSE = "lobby-change-player-count-response";

    public static readonly LOBBY_CHANGE_GAME_PLAYER_SIZE = "lobby-change-game-player-size";
    public static readonly LOBBY_CHANGE_GAME_PLAYER_SIZE_RESPONSE = "lobby-change-game-player-size-response";

    public static readonly LOBBY_CHANGE_GAME_BALL_SIZE = "lobby-change-game-ball-size";
    public static readonly LOBBY_CHANGE_GAME_BALL_SIZE_RESPONSE = "lobby-change-game-ball-size-response";

    public static readonly LOBBY_CHANGE_GAME_PLAYER_SPEED = "lobby-change-game-player-speed";
    public static readonly LOBBY_CHANGE_GAME_PLAYER_SPEED_RESPONSE = "lobby-change-game-player-speed-response";

    public static readonly LOBBY_CHANGE_GAME_BALL_SPEED = "lobby-change-game-ball-speed";
    public static readonly LOBBY_CHANGE_GAME_BALL_SPEED_RESPONSE = "lobby-change-game-ball-speed-response";

    public static readonly LOBBY_CHANGE_GAME_PLAYER_LIFE = "lobby-change-game-player-life";
    public static readonly LOBBY_CHANGE_GAME_PLAYER_LIFE_RESPONSE = "lobby-change-game-player-life-response";

    public static readonly LOBBY_SET_READY = "lobby-set-ready";

    //#endregion

    //#region GAME

    public static readonly GAME_INIT = "game-init";

    public static readonly GAME_START = "game-start";
    
    public static readonly GAME_END = "game-end";
    
    public static readonly GAME_UPDATE = "game-update";
    
    public static readonly GAME_CLIENT_INPUTS = "game-client-inputs";
    
    public static readonly GAME_SCORE = "game-score";
    
    public static readonly GAME_ROUND_START = "game-round-start";
    public static readonly GAME_ROUND_END = "game-round-end";

    public static readonly GAME_END_LEADERBOARD = "game-end-leaderboard";

    public static readonly GAME_PLAYERS_UPDATE = "game-players-update";

    //#endregion

}
