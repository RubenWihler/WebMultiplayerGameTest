import AccountConnectionManager from './classes/connection/account_connection_manager.js';
import ConnectionManager from './classes/connection/connection_manager.js';
import View from './classes/views/view.js';
import ViewsManager from './classes/views/views_manager.js';
import ConnectionErrorsTraductor from './classes/connection/connection_errors_traductor.js';
import LobbiesConnectionManager from './classes/connection/lobbies_connection_manager.js';

var refresh_on_disconnect = true;


//#region ----- html elements -----

//#region connection view elements
const element_connection_signin_button : HTMLButtonElement = document.getElementById('connection-signin-button') as HTMLButtonElement;
const element_connection_signup_button : HTMLButtonElement = document.getElementById('connection-signup-button') as HTMLButtonElement;
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

//home lobby creation form

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

//home host

//home settings

//home account
const element_home_account_id : HTMLSpanElement = document.getElementById('home-account-id') as HTMLSpanElement;
const element_home_account_username : HTMLSpanElement = document.getElementById('home-account-username') as HTMLSpanElement;
const element_home_account_email : HTMLSpanElement = document.getElementById('home-account-email') as HTMLSpanElement;
const element_home_account_logout_button : HTMLButtonElement = document.getElementById('home-account-logout-button') as HTMLButtonElement;

//#endregion


//#endregion


//init socket and connection stuff
const connection_manager = new ConnectionManager();
//init account connection system
const account_connection_manager = new AccountConnectionManager();

//#region ----- views configuration -----

const view_connection = new View('connection', 'connection', 'Connection', 'flex');
const view_signin = new View('signin', 'signin', 'Sign in', 'flex');
const view_signup = new View('signup', 'signup', 'Sign up', 'flex');
const view_disconnected = new View('disconnected', 'disconnected', 'Disconnected', 'flex');
const view_home = new View('home', 'home', 'Home', 'flex');

//connection events
view_connection.onDisplay.subscribe((view) => {
    //be sure that the socket is connected otherwise redirect to connection view
    if (!checkConnection()){
        ViewsManager.setActiveView('disconnected');
        return;
    }
    
});

//signin events
view_signin.onDisplay.subscribe((view) => {
    //be sure that the socket is connected otherwise redirect to connection view
    if (!checkConnection()){
        ViewsManager.setActiveView('disconnected');
        return;
    }
});

//signup events
view_signup.onDisplay.subscribe((view) => {
    //be sure that the socket is connected otherwise redirect to connection view
    if (!checkConnection()){
        ViewsManager.setActiveView('disconnected');
        return;
    }
});

//disconnected events
view_disconnected.onDisplay.subscribe((view) => {
    if (refresh_on_disconnect){
        let time_left = 3;

        element_disconnected_countdown_message.style.display = 'block';
        element_disconnected_countdown_message.style.visibility = 'visible';
        element_disconnected_countdown.innerText = time_left.toString();

        const interval = setInterval(() => {
            time_left--;
            element_disconnected_countdown.innerText = time_left.toString();
    
            if (time_left <= 0){
                clearInterval(interval);
                window.location.reload();
            }
        }, 1000);
    }
    
});
view_disconnected.onHide.subscribe((view) => {
    element_disconnected_countdown_message.style.display = 'none';
    element_disconnected_countdown_message.style.visibility = 'hidden';
    element_disconnected_error_message.style.display = 'none';
    element_disconnected_error_message.style.visibility = 'hidden';
    element_disconnected_error_message_text.innerText = '';
    element_disconnected_countdown.innerText = '3';
});

//home events
view_home.onDisplay.subscribe((view) => {
    //be sure that the socket is connected otherwise redirect to connection view
    if (!checkConnection()){
        ViewsManager.setActiveView('disconnected');
        return;
    }

    //be sure that the user is connected otherwise redirect to connection view
    if (!AccountConnectionManager.isLogged){
        ViewsManager.setActiveView('connection');
        return;
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

    //test
    LobbiesConnectionManager.getLobbiesList()
    .then((response) => {
        if (!response.success){
            alert('An error occured while getting lobbies :' + response.error);
            return;
        }

        console.log(response.lobbies);
    })
    .catch((error) => {
        alert('An error occured while getting lobbies :' + error);
    });
});

//views array that will be used by the views manager
const views = [
    view_connection,
    view_signin,
    view_signup,
    view_disconnected,
    view_home
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


// home account view
element_home_account_logout_button.addEventListener('click', () => {
    AccountConnectionManager.sendLogoutRequest();
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

//#endregion

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
    element_signup_container_username.classList.remove('error');
    element_signup_container_email.classList.remove('error');
    element_signup_container_password.classList.remove('error');
    element_signup_container_password_confirm.classList.remove('error');
    element_login_container_username.classList.remove('error');
    element_login_container_password.classList.remove('error');
}

function checkConnection() : boolean {
    if (!ConnectionManager.isConnected) {
        alert('an error occured ...');
        ViewsManager.setActiveView('disconnected');
        return false;
    }

    return true;
}