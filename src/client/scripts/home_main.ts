import AccountConnectionManager from './classes/connection/account_connection_manager.js';
import ConnectionManager from './classes/connection/connection_manager.js';
const connection_manager = new ConnectionManager();
const account_connection_manager = new AccountConnectionManager();


const element_login_form : HTMLFormElement = document.getElementById('signin-form') as HTMLFormElement;
const element_login_username : HTMLInputElement = document.getElementById('signin-username') as HTMLInputElement;
const element_login_password : HTMLInputElement = document.getElementById('signin-password') as HTMLInputElement;

const element_signup_form : HTMLFormElement = document.getElementById('signup-form') as HTMLFormElement;
const element_signup_email : HTMLInputElement = document.getElementById('signup-email') as HTMLInputElement;
const element_signup_username : HTMLInputElement = document.getElementById('signup-username') as HTMLInputElement;
const element_signup_password : HTMLInputElement = document.getElementById('signup-password') as HTMLInputElement;
const element_signup_password_confirm : HTMLInputElement = document.getElementById('signup-password-confirm') as HTMLInputElement;

const element_logout_button : HTMLButtonElement = document.getElementById('logout-button') as HTMLButtonElement;

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

ConnectionManager.onConnect.subscribe(() => {
    AccountConnectionManager.tryLoginWithLocalStorage()
    .then((login_response) => {
        if (login_response) {
            console.log('[+] logged in with local storage');
            return;
        }
        
        console.log('[!] tried to login with local storage but failed');
    })
    .catch((error) => {
        console.log('[!] error while trying to login with local storage : ' + error);
    });
});

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
element_logout_button.addEventListener('click', (event) => {
    if (!checkConnection()) {
        event.preventDefault();
        return;
    }

    AccountConnectionManager.sendLogoutRequest();
    event.preventDefault();
});

ConnectionManager.onConnect.subscribe(() => {
    console.log('[+] socket connected');
});
ConnectionManager.onDisconnect.subscribe(() => {
    displayLogoutButton();
    alert('Disconnected from server !\r\nThe page will be refreshed ...');
    location.reload();
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
        alert('an error occured, the page will be refreshed ...');
        location.reload();
        return false;
    }

    return true;
}