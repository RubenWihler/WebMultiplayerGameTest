import AccountConnectionManager from './classes/connection/account_connection_manager.js';
import ConnectionManager from './classes/connection/connection_manager.js';
import View from './classes/views/view.js';
import ViewsManager from './classes/views/views_manager.js';
import ConnectionErrorsTraductor from './classes/connection/connection_errors_traductor.js';

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
//#endregion

//#region sign up view elements
const element_signup_form : HTMLFormElement = document.getElementById('signup-form') as HTMLFormElement;
const element_signup_email : HTMLInputElement = document.getElementById('signup-email') as HTMLInputElement;
const element_signup_username : HTMLInputElement = document.getElementById('signup-username') as HTMLInputElement;
const element_signup_password : HTMLInputElement = document.getElementById('signup-password') as HTMLInputElement;
const element_signup_password_confirm : HTMLInputElement = document.getElementById('signup-password-confirm') as HTMLInputElement;
//#endregion

//#region disconnected view elements
const element_disconnected_countdown : HTMLSpanElement = document.getElementById('disconnected-countdown') as HTMLSpanElement;
const element_disconnected_countdown_message : HTMLSpanElement = document.getElementById('disconnected-countdown-message') as HTMLSpanElement;
const element_disconnected_error_message : HTMLSpanElement = document.getElementById('disconnected-error-message') as HTMLSpanElement;
const element_disconnected_error_message_text : HTMLSpanElement = document.getElementById('disconnected-error-message-text') as HTMLSpanElement;
//#endregion


const element_logout_button : HTMLButtonElement = document.getElementById('logout-button') as HTMLButtonElement;

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

    console.log('test emit ...');
    connection_manager.socket.emit('test', {monObj: {monText2:"test2"}, monText:"test"});
    console.log('test emit done');
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

    const username = element_login_username.value;
    const password = element_login_password.value;
    
    AccountConnectionManager.sendLoginRequest(username, password);
    event.preventDefault();
});
//#endregion

//#region sign up view event listeners
element_signup_form.addEventListener('submit', (event) => {
    if (!checkConnection()) {
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
//#endregion


element_logout_button.addEventListener('click', (event) => {
    if (!checkConnection()) {
        event.preventDefault();
        return;
    }

    AccountConnectionManager.sendLogoutRequest();
    event.preventDefault();
});

//#endregion

const displayLogoutButton = function() {
    console.log('[+] logged in : ' + AccountConnectionManager.isLogged);

    if (!AccountConnectionManager.isLogged){
        element_logout_button.style.display = 'none';
        element_logout_button.style.visibility = 'hidden';
        return;
    }

    element_logout_button.style.display = 'block';
    element_logout_button.style.visibility = 'visible';
}

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
    if (login_response.success) {
        alert('Login success');
    }
    else {
        console.log(JSON.stringify(login_response));
        let errormsg : string = "login failed : ";
        login_response.messages.forEach((error : string) => {
            errormsg += error + "\n";
        });

        alert(errormsg);
    }
});
ConnectionManager.onSignup.subscribe((signup_response) => {
    if (signup_response.success) {
        alert('Signup success');
    }
    else {
        console.log(JSON.stringify(signup_response));
        let errormsg : string = "Signup failed : ";
        signup_response.messages.forEach((error : string) => {
            errormsg += error + "\n";
        });

        alert(errormsg);
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

// display logout button if logged in or not
ConnectionManager.onSignup.subscribe(displayLogoutButton);
ConnectionManager.onLogin.subscribe(displayLogoutButton);
ConnectionManager.onLogout.subscribe(displayLogoutButton);
AccountConnectionManager.onUserLogin.subscribe(displayLogoutButton);


function checkConnection() : boolean {
    if (!ConnectionManager.isConnected) {
        alert('an error occured ...');
        ViewsManager.setActiveView('disconnected');
        return false;
    }

    return true;
}