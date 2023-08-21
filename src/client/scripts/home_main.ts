import AccountConnectionManager from './classes/connection/account_connection_manager.js';
import ConnectionManager from './classes/connection/connection_manager.js';
import View from './classes/views/view.js';
import ViewsManager from './classes/views/views_manager.js';
import ConnectionErrorsTraductor from './classes/connection/connection_errors_traductor.js';
import LobbiesConnectionManager from './classes/connection/lobbies_connection_manager.js';
import LobbyListItem from './classes/ui/elements/lobby_list_item.js';
import { LobbyData } from './classes/connection/types/lobbies_types.js';
import PlayerListItem from './classes/ui/elements/player_list_item.js';
import SettingsElement from './classes/ui/elements/lobby_settings_item.js';
import { Setting, SettingsType, SettingConstraint } from './classes/settings/settings_system.js';
import { init as initGame, start as startGame } from './classes/game/game_main.js';
import GameSettings, { PlayerData } from './classes/game/game_settings.js';
import GameConnectionManager from './classes/connection/game_connection_manager.js';
import { InitPackage } from './classes/game/engine/packages.js';

var trying_to_join_lobby: boolean = false;
var refresh_on_disconnect = true;
var lobbies_elements_list: LobbyListItem[] = [];
var lobby_player_elements_list: PlayerListItem[] = [];
var lobby_settings_elements_list: SettingsElement[] = [];
var disconnected_refresh_interval: any = null;

//#region ----- html elements -----

//#region connection view elements

const element_connection_signin_button : HTMLButtonElement = document.getElementById('connection-signin-button') as HTMLButtonElement;
const element_connection_signup_button : HTMLButtonElement = document.getElementById('connection-signup-button') as HTMLButtonElement;
const element_connection_guest_button: HTMLButtonElement = document.getElementById('connection-guest-button') as HTMLButtonElement;

//#endregion

//#region sign in view elements
const element_login_form : HTMLFormElement = document.getElementById('signin-form') as HTMLFormElement;
const element_login_username : HTMLInputElement = document.getElementById('signin-username') as HTMLInputElement;
const element_login_password : HTMLInputElement = document.getElementById('signin-password') as HTMLInputElement;
const element_login_container_username : HTMLDivElement = document.getElementById('signin-container-username') as HTMLDivElement;
const element_login_container_password : HTMLDivElement = document.getElementById('signin-container-password') as HTMLDivElement;
const element_login_errormsg_username : HTMLSpanElement = document.getElementById('signin-errormsg-username') as HTMLSpanElement;
const element_login_errormsg_password : HTMLSpanElement = document.getElementById('signin-errormsg-password') as HTMLSpanElement;
const element_login_signup_button : HTMLButtonElement = document.getElementById('signin-signup-button') as HTMLButtonElement;
//#endregion

//#region sign up view elements
const element_signup_form : HTMLFormElement = document.getElementById('signup-form') as HTMLFormElement;
const element_signup_email : HTMLInputElement = document.getElementById('signup-email') as HTMLInputElement;
const element_signup_username : HTMLInputElement = document.getElementById('signup-username') as HTMLInputElement;
const element_signup_password : HTMLInputElement = document.getElementById('signup-password') as HTMLInputElement;
const element_signup_password_confirm : HTMLInputElement = document.getElementById('signup-password-confirm') as HTMLInputElement;
const element_signup_container_email : HTMLDivElement = document.getElementById('signup-container-email') as HTMLDivElement;
const element_signup_container_username : HTMLDivElement = document.getElementById('signup-container-username') as HTMLDivElement;
const element_signup_container_password : HTMLDivElement = document.getElementById('signup-container-password') as HTMLDivElement;
const element_signup_container_password_confirm : HTMLDivElement = document.getElementById('signup-container-password-confirm') as HTMLDivElement;
const element_signup_errormsg_email : HTMLSpanElement = document.getElementById('signup-errormsg-email') as HTMLSpanElement;
const element_signup_errormsg_username : HTMLSpanElement = document.getElementById('signup-errormsg-username') as HTMLSpanElement;
const element_signup_errormsg_password : HTMLSpanElement = document.getElementById('signup-errormsg-password') as HTMLSpanElement;
const element_signup_errormsg_password_confirm : HTMLSpanElement = document.getElementById('signup-errormsg-password-confirm') as HTMLSpanElement;
const element_signup_signin_button : HTMLButtonElement = document.getElementById('signup-signin-button') as HTMLButtonElement;
//#endregion

//#region disconnected view elements
const element_disconnected_countdown : HTMLSpanElement = document.getElementById('disconnected-countdown') as HTMLSpanElement;
const element_disconnected_countdown_message : HTMLSpanElement = document.getElementById('disconnected-countdown-message') as HTMLSpanElement;
const element_disconnected_error_message : HTMLSpanElement = document.getElementById('disconnected-error-message') as HTMLSpanElement;
const element_disconnected_error_message_text : HTMLSpanElement = document.getElementById('disconnected-error-message-text') as HTMLSpanElement;
//#endregion

//#region home view elements


//home panel
const element_home_panel_join_button : HTMLButtonElement = document.getElementById('home-panel-join-button') as HTMLButtonElement;
const element_home_panel_host_button : HTMLButtonElement = document.getElementById('home-panel-host-button') as HTMLButtonElement;
const element_home_panel_settings_button : HTMLButtonElement = document.getElementById('home-panel-settings-button') as HTMLButtonElement;
const element_home_panel_account_button : HTMLButtonElement = document.getElementById('home-panel-account-button') as HTMLButtonElement;
const element_home_panel_username : HTMLSpanElement = document.getElementById('home-panel-username') as HTMLSpanElement;

//home views
const element_home_view_join : HTMLDivElement = document.getElementById('home-view-join') as HTMLDivElement;
const element_home_view_host : HTMLDivElement = document.getElementById('home-view-host') as HTMLDivElement;
const element_home_view_settings : HTMLDivElement = document.getElementById('home-view-settings') as HTMLDivElement;
const element_home_view_account : HTMLDivElement = document.getElementById('home-view-account') as HTMLDivElement;

//home join
const element_home_join_lobbies_list : HTMLDivElement = document.getElementById('home-join-lobby-list') as HTMLDivElement;
const element_home_join_refresh_button : HTMLButtonElement = document.getElementById('home-join-lobby-refresh-button') as HTMLButtonElement;
const element_home_join_form : HTMLFormElement = document.getElementById('home-join-card-code-form') as HTMLFormElement;
const element_home_join_code : HTMLInputElement = document.getElementById('home-join-code-code') as HTMLInputElement;
const element_home_join_container_code : HTMLDivElement = document.getElementById('home-join-container-code') as HTMLDivElement;
const element_home_join_errormsg_code : HTMLSpanElement = document.getElementById('home-join-code-errormsg-code') as HTMLSpanElement;

//home host
const element_home_host_form : HTMLFormElement = document.getElementById('home-host-form') as HTMLFormElement;
const element_home_host_name : HTMLInputElement = document.getElementById('home-host-name') as HTMLInputElement;
const element_home_host_password : HTMLInputElement = document.getElementById('home-host-password') as HTMLInputElement;
const element_home_host_max_players : HTMLInputElement = document.getElementById('home-host-maxplayer') as HTMLInputElement;
const element_home_host_container_name : HTMLDivElement = document.getElementById('home-host-container-name') as HTMLDivElement;
const element_home_host_container_password : HTMLDivElement = document.getElementById('home-host-container-password') as HTMLDivElement;
const element_home_host_container_max_players : HTMLDivElement = document.getElementById('home-host-container-maxplayer') as HTMLDivElement;
const element_home_host_errormsg_name : HTMLSpanElement = document.getElementById('home-host-errormsg-name') as HTMLSpanElement;
const element_home_host_errormsg_password : HTMLSpanElement = document.getElementById('home-host-errormsg-password') as HTMLSpanElement;
const element_home_host_errormsg_max_players : HTMLSpanElement = document.getElementById('home-host-errormsg-maxplayer') as HTMLSpanElement;

//home settings

//home account
const element_home_account_id : HTMLSpanElement = document.getElementById('home-account-id') as HTMLSpanElement;
const element_home_account_username : HTMLSpanElement = document.getElementById('home-account-username') as HTMLSpanElement;
const element_home_account_email : HTMLSpanElement = document.getElementById('home-account-email') as HTMLSpanElement;
const element_home_account_logout_button : HTMLButtonElement = document.getElementById('home-account-logout-button') as HTMLButtonElement;
const element_home_account_delete_button : HTMLButtonElement = document.getElementById('home-account-delete-button') as HTMLButtonElement;

//#endregion

//#region delete account view elements
const element_delete_account_form : HTMLFormElement = document.getElementById('delete-account-form') as HTMLFormElement;
const element_delete_account_password : HTMLInputElement = document.getElementById('delete-account-password') as HTMLInputElement;
const element_delete_account_container_password : HTMLDivElement = document.getElementById('delete-account-container-password') as HTMLDivElement;
const element_delete_account_errormsg_password : HTMLSpanElement = document.getElementById('delete-account-errormsg-password') as HTMLSpanElement;
const element_delete_account_return_button : HTMLButtonElement = document.getElementById('delete-account-return-button') as HTMLButtonElement;
//#endregion

//#region lobby password view elements
const element_lobby_password_form : HTMLFormElement = document.getElementById('lobby-password-form') as HTMLFormElement;
const element_lobby_password_password : HTMLInputElement = document.getElementById('lobby-password-password') as HTMLInputElement;
const element_lobby_password_container_password : HTMLDivElement = document.getElementById('lobby-password-container-password') as HTMLDivElement;
const element_lobby_password_errormsg_password : HTMLSpanElement = document.getElementById('lobby-password-errormsg-password') as HTMLSpanElement;
const element_lobby_password_return_button : HTMLButtonElement = document.getElementById('lobby-password-return-button') as HTMLButtonElement;
//#endregion

//#region Lobby
const element_lobby_leave_button : HTMLButtonElement = document.getElementById('lobby-leave-button') as HTMLButtonElement;
const element_lobby_ready_button : HTMLButtonElement = document.getElementById('lobby-ready-button') as HTMLButtonElement;
const element_lobby_copy_code_button : HTMLButtonElement = document.getElementById('lobby-copy-code-button') as HTMLButtonElement;
const element_lobby_copy_code_span : HTMLSpanElement = document.getElementById('lobby-copy-code-span') as HTMLSpanElement;

const element_lobby_players_list : HTMLDivElement = document.getElementById('lobby-players-list') as HTMLDivElement;
const element_lobby_settings_list : HTMLDivElement = document.getElementById('lobby-settings-list') as HTMLDivElement;

const element_lobby_explanations_text : HTMLParagraphElement = document.getElementById('lobby-explanations-text') as HTMLParagraphElement;

//#endregion

//#endregion

//#region ----- initializations -----

//init socket and connection stuff
const connection_manager = new ConnectionManager();
//init account connection system
const account_connection_manager = new AccountConnectionManager();

//#endregion

//#region ----- views configuration -----

const view_connection = new View('connection', 'connection', 'Connection', 'flex');
const view_signin = new View('signin', 'signin', 'Sign in', 'flex');
const view_signup = new View('signup', 'signup', 'Sign up', 'flex');
const view_disconnected = new View('disconnected', 'disconnected', 'Disconnected', 'flex');
const view_home = new View('home', 'home', 'Home', 'flex');
const view_delete_account = new View('delete-account', 'delete-account', 'Delete account', 'flex');
const view_lobby_password = new View('lobby-password', 'lobby-password', 'Lobby password', 'flex');
const view_lobby = new View('lobby', 'lobby', 'Lobby', 'flex');
const view_game = new View('game', 'game', 'Game', 'flex');

//connection events
view_connection.onDisplay.subscribe((view) => {
    
});

//signin events
view_signin.onDisplay.subscribe((view) => {
    
});

//signup events
view_signup.onDisplay.subscribe((view) => {
    
});

//disconnected events
view_disconnected.onDisplay.subscribe((view) => {
    if (refresh_on_disconnect){
        let time_left = 3;

        element_disconnected_countdown_message.style.display = 'block';
        element_disconnected_countdown_message.style.visibility = 'visible';
        element_disconnected_countdown.innerText = time_left.toString();

        disconnected_refresh_interval = setInterval(() => {
            time_left--;
            element_disconnected_countdown.innerText = time_left.toString();
    
            if (time_left <= 0){
                clearInterval(disconnected_refresh_interval);
                window.location.reload();
            }
        }, 1000);
    }
    
});
view_disconnected.onHide.subscribe((view) => {
    if (disconnected_refresh_interval != null)
        clearInterval(disconnected_refresh_interval);

    element_disconnected_countdown_message.style.display = 'none';
    element_disconnected_countdown_message.style.visibility = 'hidden';
    element_disconnected_error_message.style.display = 'none';
    element_disconnected_error_message.style.visibility = 'hidden';
    element_disconnected_error_message_text.innerText = '';
    element_disconnected_countdown.innerText = '3';
});

//home events
view_home.onDisplay.subscribe((view) => {

    if (trying_to_join_lobby){
        LobbiesConnectionManager.joinLobby(LobbiesConnectionManager.instance.targetLobbyId, null);   
    }

    //set panel-bottom username
    element_home_panel_username.innerText = AccountConnectionManager.userData.username;

    //set home account view infos
    console.log(AccountConnectionManager.userData);
    element_home_account_id.innerText = AccountConnectionManager.userData.userId.toString();
    element_home_account_username.innerText = AccountConnectionManager.userData.username;
    element_home_account_email.innerText = AccountConnectionManager.userData.email;

    //dipsplay home join view
    setHomeViewActive('join');

    //refresh lobbies
    sendRefreshLobbiesList();
});

//delete account events
view_delete_account.onDisplay.subscribe((view) => {
    
});
view_delete_account.onHide.subscribe((view) => {
    //clear form
    element_delete_account_password.value = '';
    element_delete_account_errormsg_password.innerText = '';
    element_delete_account_container_password.classList.remove('error');
});

//lobby password events
view_lobby_password.onDisplay.subscribe((view) => {
    
});
view_lobby_password.onHide.subscribe((view) => {
    //clear form
    element_lobby_password_password.value = '';
    element_lobby_password_errormsg_password.innerText = '';
    element_lobby_password_container_password.classList.remove('error');
});

//lobby events
view_lobby.onDisplay.subscribe((view) => {
    element_lobby_copy_code_span.innerText = LobbiesConnectionManager.currentLobbyData.id.toString();
});

//game events
view_game.onDisplay.subscribe((view) => {
    //clear game container
    document.getElementById('game-container').innerHTML = '';
});

//views array that will be used by the views manager
const views = [
    view_connection,
    view_signin,
    view_signup,
    view_disconnected,
    view_home,
    view_delete_account,
    view_lobby_password,
    view_lobby,
    view_game
];

//init views manager with created views
const views_manager = ViewsManager.Initialize(views);

//#endregion

//#region ----- event listeners -----

//#region connection view event listeners
element_connection_signin_button.addEventListener('click', (event) => {
    if (!checkConnection()) return;
    ViewsManager.setActiveView('signin');
});
element_connection_signup_button.addEventListener('click', (event) => {
    if (!checkConnection()) return;
    ViewsManager.setActiveView('signup');
});
element_connection_guest_button.addEventListener('click', async (event) => {
    if (!checkConnection()) return;

    event.preventDefault();
    const result = await AccountConnectionManager.signupAsGuest();
});
//#endregion

//#region sign in view event listeners
element_login_form.addEventListener('submit', (event) => {
    if (!checkConnection()) {
        event.preventDefault();
        return;
    }

    if (AccountConnectionManager.isLogged){
        ViewsManager.setActiveView('home');
        event.preventDefault();
        return;
    }

    const username = element_login_username.value;
    const password = element_login_password.value;
    
    AccountConnectionManager.sendLoginRequest(username, password);
    event.preventDefault();
});

element_login_signup_button.addEventListener('click', (event) => {
    ViewsManager.setActiveView('signup');
});
//#endregion

//#region sign up view event listeners
element_signup_form.addEventListener('submit', (event) => {
    if (!checkConnection()) {
        event.preventDefault();
        return;
    }

    if (AccountConnectionManager.isLogged){
        ViewsManager.setActiveView('home');
        event.preventDefault();
        return;
    }

    const email = element_signup_email.value;
    const username = element_signup_username.value;
    const password = element_signup_password.value;
    const password_confirm = element_signup_password_confirm.value;

    AccountConnectionManager.sendSignupRequest(email, username, password, password_confirm);
    event.preventDefault();
});
element_signup_signin_button.addEventListener('click', (event) => {
    ViewsManager.setActiveView('signin');
});
//#endregion

//#region home view event listeners

// home views
const home_views = new Map<string, {view: HTMLDivElement, button: HTMLButtonElement}>([
    ['join',        { view: element_home_view_join,      button: element_home_panel_join_button}],
    ['host',        { view: element_home_view_host,      button: element_home_panel_host_button}],
    ['settings',    { view: element_home_view_settings,  button: element_home_panel_settings_button}],
    ['account',     { view: element_home_view_account,   button: element_home_panel_account_button}]
]);

// home join
element_home_join_refresh_button.addEventListener('click', () => {
    sendRefreshLobbiesList();
});
element_home_panel_join_button.addEventListener('click', () => {
    setHomeViewActive('join');
});
element_home_panel_host_button.addEventListener('click', () => {
    setHomeViewActive('host');
});
element_home_panel_settings_button.addEventListener('click', () => {
    setHomeViewActive('settings');
});
element_home_panel_account_button.addEventListener('click', () => {
    setHomeViewActive('account');
});

element_home_join_form.addEventListener('submit', async (event) => {
    if (!checkConnection()) {
        event.preventDefault();
        return;
    }

    if (!AccountConnectionManager.isLogged){
        ViewsManager.setActiveView('connection');
        event.preventDefault();
        return;
    }

    const id = element_home_join_code.value;

    //prevent default before async call
    event.preventDefault();

    const result = await LobbiesConnectionManager.joinLobby(id, null);
    if (!result.success){
        result.messages.forEach(error => {
            const error_code = error.toString();

            switch (error_code) {
                case 'LOBBY_ID_REQUIRED':
                    element_home_join_errormsg_code.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_home_join_container_code.classList.add('error');
                    break;

                case 'LOBBY_NOT_FOUND':
                    element_home_join_errormsg_code.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_home_join_container_code.classList.add('error');
                    break;

                case 'LOBBY_FULL':
                    element_home_join_errormsg_code.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_home_join_container_code.classList.add('error');
                    break;
                
                case 'LOBBY_BANNED':
                    element_home_join_errormsg_code.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_home_join_container_code.classList.add('error');
                    break;

                default:
                    alert(error_code);
                    break;
            }
        });

        return;
    }

    cleanForms();
});

// home host
element_home_host_form.addEventListener('submit', async (event) => {
    if (!checkConnection()) {
        event.preventDefault();
        return;
    }

    if (!AccountConnectionManager.isLogged){
        ViewsManager.setActiveView('connection');
        event.preventDefault();
        return;
    }

    const name = element_home_host_name.value;
    const max_players = Number(element_home_host_max_players.value);
    let password = element_home_host_password.value;

    if (password === '') {
        password = null;
    }

    //prevent default before await
    event.preventDefault();

    const result = await LobbiesConnectionManager.createLobby(name, password, max_players);
    if (!result.success){
        result.messages.forEach(error => {
            const error_code = error.toString();

            switch (error_code) {
                case 'LOBBY_NAME_REQUIRED':
                    element_home_host_errormsg_name.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_home_host_container_name.classList.add('error');
                    element_home_host_name.focus();
                    break;
                
                case 'LOBBY_MAX_PLAYERS_REQUIRED':
                    element_home_host_errormsg_max_players.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_home_host_container_max_players.classList.add('error');
                    element_home_host_max_players.focus();
                    break;
                
                default:
                    alert(ConnectionErrorsTraductor.getMessage(error_code));
                    break;
            }
        });

        return;
    }
});


// home account view
element_home_account_logout_button.addEventListener('click', () => {
    AccountConnectionManager.sendLogoutRequest();
});
element_home_account_delete_button.addEventListener('click', () => {
    ViewsManager.setActiveView('delete-account');
});


// element_home_lobby_creation_form.addEventListener('submit', (event) => {
//     if (!checkConnection()) {
//         event.preventDefault();
//         return;
//     }

//     const name = element_home_lobby_creation_name.value;
//     const max_players = Number(element_home_lobby_creation_max_players.value);
//     let password = element_home_lobby_creation_password.value;

//     if (password === '') {
//         password = null;
//     }

//     LobbiesConnectionManager.createLobby(name, password, max_players)
//     .then((result) => {
//         if (!result.success) {
//             alert(`The lobby creation failed :\n${result.messages.join('\n')}`);
//             return;
//         }

//         console.log('[+] lobby created : ' + JSON.stringify(result));
//     });

//     event.preventDefault();
// });

// element_home_lobby_join_form.addEventListener('submit', (event) => {
//     if (!checkConnection()) {
//         event.preventDefault();
//         return;
//     }

//     const errors = [];
//     const id = element_home_lobby_join_id.value;
//     let password = element_home_lobby_join_password.value;

//     //check if the id is empty
//     if (id === '') {
//         errors.push('Please enter a lobby id');
//     }
    
//     //if the password is empty, set it to null
//     if (password === '') {
//         password = null;
//     }
    
//     if (errors.length > 0) {
//         alert('Lobby join error :\n' + errors.join('\n'));
//         return;
//     }

//     LobbiesConnectionManager.joinLobby(id, password)
//     .then((result) => {
//         if (!result.success) {
//             alert('Lobby join error :\n' + result.messages.join('\n'));
//             return;
//         }

//         console.log('[+] lobby joined : ' + id);
//     });

//     event.preventDefault();
// });

// element_home_lobby_leave_button.addEventListener('click', (event) => {
//     if (!checkConnection()) {
//         event.preventDefault();
//         return;
//     }

//     LobbiesConnectionManager.leaveLobby()
//     .then((result) => {
//         if (!result.success) {
//             alert('Lobby leave error :\n' + result.messages.join('\n'));
//             return;
//         }
//     });

//     event.preventDefault();
// });



//#endregion

//#region delete account view event listeners

element_delete_account_form.addEventListener('submit', (event) => {
    if (!checkConnection()) {
        event.preventDefault();
        return;
    }

    //verify that is logged in
    if (!AccountConnectionManager.isLogged) {
        ViewsManager.setActiveView('connection');
        event.preventDefault();
        return;
    }

    const id = AccountConnectionManager.userData.userId;
    const password = element_delete_account_password.value;

    AccountConnectionManager.sendDeleteAccountRequest(id, password);
    event.preventDefault();
});
element_delete_account_return_button.addEventListener('click', () => {
    cleanForms();
    ViewsManager.setActiveView('home');
});

//#endregion

//#region lobby password view event listeners

element_lobby_password_form.addEventListener('submit', async (event) => {
    if (!checkConnection()) {
        event.preventDefault();
        return;
    }

    //verify that is logged in
    if (!AccountConnectionManager.isLogged) {
        ViewsManager.setActiveView('connection');
        event.preventDefault();
        return;
    }

    const id = LobbiesConnectionManager.instance.targetLobbyId;
    const password = element_lobby_password_password.value;

    //prevent the form from being sent before async call
    event.preventDefault();

    const result = await LobbiesConnectionManager.joinLobby(id, password);
    if (!result.success) {
        result.messages.forEach((error) => {
            const error_code = error.toString();

            switch (error_code) {
                case 'LOBBY_PASSWORD_REQUIRED':
                    element_lobby_password_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_lobby_password_container_password.classList.add('error');
                    element_lobby_password_password.focus();
                    break;

                case 'LOBBY_PASSWORD_INVALID':
                    element_lobby_password_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_lobby_password_container_password.classList.add('error');
                    element_lobby_password_password.focus();
                    break;

                case 'LOBBY_NOT_FOUND':
                    element_lobby_password_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_lobby_password_container_password.classList.add('error');
                    element_lobby_password_password.focus();
                    break;

                case 'LOBBY_FULL':
                    element_lobby_password_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_lobby_password_container_password.classList.add('error');
                    element_lobby_password_password.focus();
                    break;

                default:
                    element_lobby_password_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                    element_lobby_password_container_password.classList.add('error');
                    element_lobby_password_password.focus();
                    break;
            }
        });

        return;
    }
});
element_lobby_password_return_button.addEventListener('click', () => {
    cleanForms();
    trying_to_join_lobby = false;
    removeParamFromUrl('lobby');
    ViewsManager.setActiveView('home');
});



//#endregion

//#region lobby view event listeners

element_lobby_leave_button.addEventListener('click', (event) => {
    if (!LobbiesConnectionManager.instance.inLobby) return;
    LobbiesConnectionManager.leaveLobby()
    .then((response) => {
        if (!response.success) {
            alert('Lobby leave error :\n' + response.messages.join('\n'));
        }
    })
    .catch((error) => {
        alert('Lobby leave error :\n' + error);
    });
});

element_lobby_copy_code_button.addEventListener('click', (event) => {
    if (!LobbiesConnectionManager.instance.inLobby) return;

    const url = `${window.location.origin}/?lobby=${LobbiesConnectionManager.currentLobbyData.id}`;

    navigator.clipboard.writeText(url);
});
element_lobby_ready_button.addEventListener('click', () => {
    const ready = !LobbiesConnectionManager.instance.isReady;
    LobbiesConnectionManager.setReady(ready);

    // <button id="lobby-ready-button" class="fill-button waiting">
        //     <span>waiting <span>for players</span></span>
        //     <div class="dot-pulse"></div>
        // </button>

    if (ready) {
        element_lobby_ready_button.classList.add('waiting');
        element_lobby_ready_button.innerHTML = `
            <span>waiting <span>for players</span></span>
            <div class="dot-pulse"></div>`;
    }
    else{
        element_lobby_ready_button.classList.remove('waiting');
        element_lobby_ready_button.innerHTML = '<span>set ready</span>';
    }
});

//#endregion

//#endregion

//#region ----- connection manager events -----

AccountConnectionManager.onUserLogin.subscribe((user) => {
    ViewsManager.setActiveView('home');   
});
ConnectionManager.onConnect.subscribe(() => {
    //try to login with credentials in local storage
    AccountConnectionManager.tryLoginWithLocalStorage()
    .then((login_response) => {
        if (login_response) {
            console.log('[+] logged in with local storage');
            return;
        }
        
        console.log('[!] tried to login with local storage but failed');
        ViewsManager.setActiveView('connection');
    })
    .catch((error) => {
        console.log('[!] error while trying to login with local storage : ' + error);
        ViewsManager.setActiveView('connection');
    });
});
ConnectionManager.onConnectionError.subscribe((error) => {
    const code = error.code;
    const message = ConnectionErrorsTraductor.getMessage(code);

    element_disconnected_error_message.style.display = 'block';
    element_disconnected_error_message.style.visibility = 'visible';
    element_disconnected_error_message_text.innerHTML = message;

    switch (code) {
        case "OTHER_DEVICE_LOGGED_IN":
            refresh_on_disconnect = false;
            break;
    
        default:
            break;
    }
});
ConnectionManager.onAccountDeleted.subscribe((response) => {
    if(ViewsManager.activeView.name !== 'delete-account') {
        return;
    }

    //reset errors messages
    element_delete_account_errormsg_password.innerText = '';
    element_delete_account_container_password.classList.remove('error');


    if (response.success) {
        cleanForms();
        return;
    }
    
    response.messages.forEach((error) => {
        const error_code = error.toString();

        switch (error_code) {
            case 'WRONG_CREDENTIALS':
                element_delete_account_container_password.classList.add('error');
                element_delete_account_errormsg_password.innerText = 'Wrong password';
                element_delete_account_password.focus();
                break;
            
            case 'USER_DOESNT_EXIST':
                alert(ConnectionErrorsTraductor.getMessage(error_code));
                break;
            
            case 'DATABASE_ERROR':
                alert(ConnectionErrorsTraductor.getMessage(error_code));
                break;
            
            case 'NOT_LOGGED_IN':
                alert(ConnectionErrorsTraductor.getMessage(error_code));
                break;

            case 'ID_REQUIRED':
                alert('An error occured, please logout and retry.');
                break;

            case 'PASSWORD_REQUIRED':
                element_delete_account_container_password.classList.add('error');
                element_delete_account_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error_code);
                element_delete_account_password.focus();
                break;

            default:
                alert('An error occured, please logout and retry. \nerror code: ' + error_code);
                break;
        }
    });

});
ConnectionManager.onDisconnect.subscribe(() => {
    ViewsManager.setActiveView('disconnected');
});
ConnectionManager.onLogin.subscribe((login_response) => {
    //reset errors messages
    element_login_errormsg_username.innerText = '';
    element_login_errormsg_password.innerText = '';
    element_login_container_username.classList.remove('error');
    element_login_container_password.classList.remove('error');

    if (login_response.success) {
        cleanForms();
    }
    else {
        //console.log(JSON.stringify(login_response));
        login_response.messages.forEach((error : string) => {
            if (error === 'WRONG_CREDENTIALS') {
                element_login_container_password.classList.add('error');
                element_login_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_login_password.focus();
            }
            else if (error === 'USER_ALREADY_LOGGED_IN') {
                alert(ConnectionErrorsTraductor.getMessage(error));
                ViewsManager.setActiveView('home');
            }
            else if (error === 'USERNAME_REQUIRED'){
                element_login_container_username.classList.add('error');
                element_login_errormsg_username.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_login_username.focus();
            }
            else if (error === 'PASSWORD_REQUIRED'){
                element_login_container_password.classList.add('error');
                element_login_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_login_password.focus();
            }
            else{
                alert(error);
            }
        });
    }
});
ConnectionManager.onSignup.subscribe((signup_response) => {
    //reset errors messages
    element_signup_errormsg_username.innerText = '';
    element_signup_errormsg_email.innerText = '';
    element_signup_errormsg_password.innerText = '';
    element_signup_errormsg_password_confirm.innerText = '';
    element_signup_container_username.classList.remove('error');
    element_signup_container_email.classList.remove('error');
    element_signup_container_password.classList.remove('error');
    element_signup_container_password_confirm.classList.remove('error');

    if (signup_response.success) {
        cleanForms();
    }
    else {
        //console.log(JSON.stringify(signup_response));
        signup_response.messages.forEach((error : string) => {
            if (error === 'USERNAME_ALREADY_USED') {
                element_signup_container_username.classList.add('error');
                element_signup_errormsg_username.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_username.focus();
            }
            else if (error === 'EMAIL_ALREADY_USED') {
                element_signup_container_email.classList.add('error');
                element_signup_errormsg_email.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_email.focus();
            }
            else if (error === 'PASSWORDS_DO_NOT_MATCH') {
                element_signup_container_password.classList.add('error');
                element_signup_container_password_confirm.classList.add('error');
                element_signup_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_errormsg_password_confirm.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_password.focus();
            }
            else if (error === 'USERNAME_TOO_SHORT') {
                element_signup_container_username.classList.add('error');
                element_signup_errormsg_username.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_username.focus();
            }
            else if (error === 'USERNAME_TOO_LONG') {
                element_signup_container_username.classList.add('error');
                element_signup_errormsg_username.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_username.focus();
            }
            else if (error === 'PASSWORD_TOO_SHORT') {
                element_signup_container_password.classList.add('error');
                element_signup_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_password.focus();
            }
            else if (error === 'PASSWORD_TOO_LONG') {
                element_signup_container_password.classList.add('error');
                element_signup_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_password.focus();
            }
            else if (error === 'USERNAME_REQUIRED'){
                element_signup_container_username.classList.add('error');
                element_signup_errormsg_username.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_username.focus();
            }
            else if (error === 'EMAIL_INVALID'){
                element_signup_container_email.classList.add('error');
                element_signup_errormsg_email.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_email.focus();
            }
            else if (error === 'EMAIL_REQUIRED'){
                element_signup_container_email.classList.add('error');
                element_signup_errormsg_email.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_email.focus();
            }
            else if (error === 'PASSWORD_REQUIRED'){
                element_signup_container_password.classList.add('error');
                element_signup_errormsg_password.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_password.focus();
            }
            else if (error === 'PASSWORD_CONFIRM_REQUIRED'){
                element_signup_container_password_confirm.classList.add('error');
                element_signup_errormsg_password_confirm.innerText = ConnectionErrorsTraductor.getMessage(error);
                element_signup_password_confirm.focus();
            }
            else{
                alert(error);
            }
        });
    }
});
ConnectionManager.onLogout.subscribe((logout_response) => {
    if (logout_response.success) {
        alert('Logout success ! \r\n You will be disconnected ...');
        return;
    }
    
    // the logout failed
    console.log(JSON.stringify(logout_response));
    let errormsg : string = "Logout failed : ";
    logout_response.messages.forEach((error : string) => {
        errormsg += error + "\n";
    });

    alert(errormsg);
});

//#endregion

//#region ----- Lobby -----

//check if the url contains a lobby id

function checkLobbyIdFromUrl() : void{
    const result = checkForParam('lobby');

    if (result === null) return;

    console.log('Lobby id found in url : ' + result);
    trying_to_join_lobby = true;
    LobbiesConnectionManager.instance.targetLobbyId = result;
}

function refreshPlayersList(users: {id: number, name: string, status: string}[]) {
    let owner_id = LobbiesConnectionManager.currentLobbyData.owner_id;
    let client_user_id = AccountConnectionManager.userData.userId;
    let haveOwnerPrivilege = owner_id === client_user_id;

    //clear players list and elements
    lobby_player_elements_list.forEach((item) => {
        item.dispose();
    });

    lobby_player_elements_list = [];
    element_lobby_players_list.innerHTML = '';

    users.forEach((user) => {
        const is_client = user.id === client_user_id;

        const item = new PlayerListItem(
            user.id,
            user.name,
            user.status,
            is_client,
            haveOwnerPrivilege,
            owner_id
        );

        item.onPromote.subscribe(async (id) => {
            await LobbiesConnectionManager.promoteUser(id);
        });

        item.onKick.subscribe(async (id) => {
            await LobbiesConnectionManager.kickUser(id);
        });

        item.onBan.subscribe(async (id) => {
            await LobbiesConnectionManager.banUser(id);
        });

        element_lobby_players_list.appendChild(item.element);
        lobby_player_elements_list.push(item);
    });
}

function refreshSettingsList(){
    let readonly = LobbiesConnectionManager.currentLobbyData.owner_id !== AccountConnectionManager.userData.userId;
    let using_a_password = LobbiesConnectionManager.currentLobbyData.using_password;

    //clear settings list and elements
    lobby_settings_elements_list = [];
    element_lobby_settings_list.innerHTML = '';

    //#region name

    const name = new Setting(
        'Name',
        SettingsType.TEXT,
        [SettingConstraint.TEXT_RANGE(2, 26)],
        LobbiesConnectionManager.currentLobbyData.name
    );

    name.onValueChanged.subscribe(async (value) => {
        await LobbiesConnectionManager.setName(value);
    });
    
    const name_element = new SettingsElement(
        name,
        readonly
    );

    lobby_settings_elements_list.push(name_element);

    //#endregion

    //#region max players

    const max_players = new Setting(
        'Max players',
        SettingsType.NUMBER,
        [SettingConstraint.NUMBER_RANGE(1, 9)],
        LobbiesConnectionManager.currentLobbyData.max_players
    );

    max_players.onValueChanged.subscribe(async (value) => {
        await LobbiesConnectionManager.setMaxPlayers(value);
    });

    const max_players_element = new SettingsElement(
        max_players,
        readonly
    );

    lobby_settings_elements_list.push(max_players_element);

    //#endregion

    //#region using password

    const using_password = new Setting(
        'Using password',
        SettingsType.BOOLEAN,
        [],
        LobbiesConnectionManager.currentLobbyData.using_password
    );

    using_password.onValueChanged.subscribe(async (value) => {
        const password = value ? 'default' : '';
        await LobbiesConnectionManager.setPassword(password);
    });
    
    const using_password_element = new SettingsElement(
        using_password,
        readonly
    );

    lobby_settings_elements_list.push(using_password_element);

    //#endregion

    //#region password

    //only add the password setting if the lobby is using a password
    if (using_a_password){
        const password = new Setting(
            'Password',
            SettingsType.PASSWORD,
            [SettingConstraint.TEXT_RANGE(2, 26)],
            LobbiesConnectionManager.currentLobbyData.using_password ? LobbiesConnectionManager.currentLobbyData.password : ''
        );

        password.onValueChanged.subscribe(async (value) => {
            await LobbiesConnectionManager.setPassword(value);
        });

        const password_element = new SettingsElement(
            password,
            readonly
        );

        lobby_settings_elements_list.push(password_element);
    }

    //#endregion

    //#region game player count

    const game_player_count = new Setting(
        'Game player count',
        SettingsType.NUMBER,
        [SettingConstraint.NUMBER_RANGE(1, 5)],
        LobbiesConnectionManager.currentLobbyData.game_player_count
    );

    game_player_count.onValueChanged.subscribe(async (value) => {
        const response =await LobbiesConnectionManager.setGamePlayerCount(value);
    });

    const game_player_count_element = new SettingsElement(
        game_player_count,
        readonly
    );

    lobby_settings_elements_list.push(game_player_count_element);

    //#endregion

    //#region game player life

    const game_player_life = new Setting(
        'Game player life',
        SettingsType.NUMBER,
        [SettingConstraint.NUMBER_RANGE(0, 11)],
        LobbiesConnectionManager.currentLobbyData.game_player_life
    );

    game_player_life.onValueChanged.subscribe(async (value) => {
        const response = await LobbiesConnectionManager.setGamePlayerLife(value);
    });

    const game_player_life_element = new SettingsElement(
        game_player_life,
        readonly
    );

    lobby_settings_elements_list.push(game_player_life_element);

    //#endregion

    //#region game player size

    const game_player_size = LobbiesConnectionManager.currentLobbyData.game_player_size;

    const game_player_width = new Setting(
        'Game player width',
        SettingsType.NUMBER,
        [SettingConstraint.NUMBER_RANGE(14, 701)],
        game_player_size.width
    );

    game_player_width.onValueChanged.subscribe(async (value) => {
        const response =await LobbiesConnectionManager.setGamePlayerSize({width: value, height: game_player_size.height});
    });

    const game_player_width_element = new SettingsElement(
        game_player_width,
        readonly
    );
   
    lobby_settings_elements_list.push(game_player_width_element);

    //#endregion

    //#region game ball size

    const game_ball_size = LobbiesConnectionManager.currentLobbyData.game_ball_size;

    const game_ball_width = new Setting(
        'Game ball width',
        SettingsType.NUMBER,
        [SettingConstraint.NUMBER_RANGE(9, 301)],
        game_ball_size.width
    );

    const game_ball_height = new Setting(
        'Game ball height',
        SettingsType.NUMBER,
        [SettingConstraint.NUMBER_RANGE(9, 301)],
        game_ball_size.height
    );

    game_ball_width.onValueChanged.subscribe(async (value) => {
        const response = await LobbiesConnectionManager.setGameBallSize({width: value, height: game_ball_size.height});
    });

    game_ball_height.onValueChanged.subscribe(async (value) => {
        const response =await LobbiesConnectionManager.setGameBallSize({width: game_ball_size.width, height: value});
    });

    const game_ball_width_element = new SettingsElement(
        game_ball_width,
        readonly
    );

    const game_ball_height_element = new SettingsElement(
        game_ball_height,
        readonly
    );

    lobby_settings_elements_list.push(game_ball_width_element);
    lobby_settings_elements_list.push(game_ball_height_element);

    //#endregion

    //#region game player speed

    const game_player_speed = new Setting(
        'Game player speed',
        SettingsType.NUMBER,
        [SettingConstraint.NUMBER_RANGE(0, 51)],
        LobbiesConnectionManager.currentLobbyData.game_player_speed
    );

    game_player_speed.onValueChanged.subscribe(async (value) => {
        const response =await LobbiesConnectionManager.setGamePlayerSpeed(value);
    });

    const game_player_speed_element = new SettingsElement(
        game_player_speed,
        readonly
    );

    lobby_settings_elements_list.push(game_player_speed_element);

    //#endregion

    //#region game ball speed

    const game_ball_speed = new Setting(
        'Game ball speed',
        SettingsType.NUMBER,
        [SettingConstraint.NUMBER_RANGE(0, 51)],
        LobbiesConnectionManager.currentLobbyData.game_ball_speed
    );

    game_ball_speed.onValueChanged.subscribe(async (value) => {
        const response =await LobbiesConnectionManager.setGameBallSpeed(value);
    });

    const game_ball_speed_element = new SettingsElement(
        game_ball_speed,
        readonly
    );

    lobby_settings_elements_list.push(game_ball_speed_element);

    //#endregion
    
    //append elements to the list foreach settings element
    lobby_settings_elements_list.forEach((element) => {
        element_lobby_settings_list.appendChild(element.element);
    });
}

LobbiesConnectionManager.instance.onLobbyJoined.subscribe((lobby_data: LobbyData) => {
    trying_to_join_lobby = false;
    ViewsManager.setActiveView('lobby');

    //add the lobby id to the url
    addParamToUrl('lobby', lobby_data.id);
    
    console.log('[+] Lobby joined : ' + JSON.stringify(lobby_data));
});
LobbiesConnectionManager.instance.onLobbyLeft.subscribe(() => {
    ViewsManager.setActiveView('home');
    trying_to_join_lobby = false;
    removeParamFromUrl('lobby');
});
LobbiesConnectionManager.instance.onLobbiesRefresh.subscribe((lobbies: any[]) => {
    if (lobbies == null || lobbies == undefined) return;
    refreshLobbiesList(lobbies);
});
LobbiesConnectionManager.instance.onLobbyUsersChanged.subscribe((users: {id: number, name: string, status: string}[]) => {
    refreshPlayersList(users);
    const explanations_text = LobbiesConnectionManager.currentLobbyData.owner_id == AccountConnectionManager.userData.userId ? 
    `You are the owner of this lobby.<br><br> You can promote, kick, or ban players and change the lobby settings.<br><br>The game will start when all players are ready.` 
    : `You are currently in a lobby.<br><br> You can view the lobby settings but not modify them.<br><br>The game will start when all players are ready.`;
    element_lobby_explanations_text.innerHTML = explanations_text;

});
LobbiesConnectionManager.instance.onLobbySettingsChanged.subscribe(() => {
    refreshSettingsList();
});
LobbiesConnectionManager.instance.onGameStart.subscribe((data: InitPackage) => {
    ViewsManager.setActiveView('game');

    const players_data = [];

    data.players.forEach((player) => {
        players_data.push(new PlayerData(
            player.user_id,
            player.local_id,
            player.name,
            player.color,
            player.isClient,
            player.position,
            player.size,
            player.movement_type
        ));
    });

    const settings = new GameSettings(
        players_data,
        data.ball.position,
        data.settings.map,
        data.settings.ball_speed,
        data.settings.ball_size,
        data.ball.color,
        data.settings.player_speed,
    );
    
    element_lobby_ready_button.click();
    document.getElementById('game-container').appendChild(initGame());
    
    startGame(settings);
});


//#endregion

//#region ----- Game -----

GameConnectionManager.instance.onGameEnd.subscribe(() => {
    ViewsManager.setActiveView('lobby');
});

//#endregion

//#region Functions

/**
 * Set the active tab in the home page
 * @param viewname 
 */
function setHomeViewActive(viewname: string){
    home_views.forEach((value, key) => {
        if (key === viewname){
            value.view.style.display = 'flex';
            value.view.style.visibility = 'visible';
            value.button.classList.add('current');
        }
        else {
            value.view.style.display = 'none';
            value.view.style.visibility = 'hidden';
            value.button.classList.remove('current');
        }
    });
}

/**
 * Join a lobby
 * @param lobbyId 
 * @param isPrivate 
 */
function joinLobby(lobbyId: string, isPrivate: boolean){
    if (isPrivate){
        LobbiesConnectionManager.instance.targetLobbyId = lobbyId;
        ViewsManager.setActiveView('lobby-password');
    }
    else {
        LobbiesConnectionManager.joinLobby(lobbyId, null)
        .then((result) => {
            if (!result.success){
                alert('Joining the lobby failed :\n' + result.messages.join('\n'));
                return;
            }
        })
        .catch((error) => {
            alert('Joining the lobby failed : \n' + error);
        });
    }
}

/**
 * Add a parameter to the url or replace it if it already exists
 * @param paramName  the name of the parameter
 * @param paramValue the value of the parameter
 */
function addParamToUrl(paramName: string, paramValue: string){
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set(paramName, paramValue);
    window.history.replaceState({}, '', `${location.pathname}?${urlParams}${location.hash}`);
}
/**
 * Remove a parameter from the url
 * @param paramName the name of the parameter
 */
function removeParamFromUrl(paramName: string){
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(paramName);
    window.history.replaceState({}, '', `${location.pathname}?${urlParams}${location.hash}`);
}

/**
 * Check if the url contains a parameter and return its value
 * @param paramName the name of the parameter
 * @returns the value of the parameter or null if it doesn't exist
 */
function checkForParam(paramName: string) : string | null{
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get(paramName);
    return param;
}

/**
 * refresh the lobbies list
 * @returns 
 */
async function sendRefreshLobbiesList() : Promise<void>{
    console.log('refreshing lobbies list...');
    const result = await LobbiesConnectionManager.getLobbiesList();

    if (!result.success){
        alert('An error occured while getting lobbies !');
        return;
    }

    refreshLobbiesList(result.lobbies);
}
function refreshLobbiesList(lobbies: any[]){

    //clear lobbies list and elements
    element_home_join_lobbies_list.innerHTML = '';
    lobbies_elements_list.forEach((item) => {
        item.delete();
    });
    lobbies_elements_list = [];

    
    lobbies.forEach((lobby) => {
        const item = new LobbyListItem(
            lobby.name,
            lobby.id,
            lobby.players_count,
            lobby.max_players,
            lobby.using_password,
            element_home_join_lobbies_list
        );

        item.onClick.subscribe((item) => {
            joinLobby(item.id, item.is_private);
        });

        lobbies_elements_list.push(item);
    });
}

/**
 * Clean all forms (login, signup, delete account, ...)
 */
function cleanForms() {
    element_login_username.value = '';
    element_login_password.value = '';
    element_signup_username.value = '';
    element_signup_email.value = '';
    element_signup_password.value = '';
    element_signup_password_confirm.value = '';
    element_signup_errormsg_username.innerText = '';
    element_signup_errormsg_email.innerText = '';
    element_signup_errormsg_password.innerText = '';
    element_signup_errormsg_password_confirm.innerText = '';
    element_login_errormsg_username.innerText = '';
    element_login_errormsg_password.innerText = '';
    element_delete_account_errormsg_password.innerText = '';
    element_home_host_errormsg_name.innerText = '';
    element_home_host_errormsg_password.innerText = '';
    element_home_host_errormsg_max_players.innerText = '';
    element_home_join_errormsg_code.innerText = '';
    element_signup_container_username.classList.remove('error');
    element_signup_container_email.classList.remove('error');
    element_signup_container_password.classList.remove('error');
    element_signup_container_password_confirm.classList.remove('error');
    element_login_container_username.classList.remove('error');
    element_login_container_password.classList.remove('error');
    element_delete_account_container_password.classList.remove('error');
    element_home_host_container_name.classList.remove('error');
    element_home_host_container_password.classList.remove('error');
    element_home_host_container_max_players.classList.remove('error');
    element_home_join_container_code.classList.remove('error');
}

/**
 * Check if the socket is connected
 * @returns 
 */
function checkConnection() : boolean {
    if (!ConnectionManager.isConnected) {
        alert('an error occured ...');
        ViewsManager.setActiveView('disconnected');
        return false;
    }

    return true;
}


//#endregion

checkLobbyIdFromUrl();