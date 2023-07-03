import ConnectionManager from './classes/connection/connection_manager.js';
const connection_manager = new ConnectionManager();

const element_login_form : HTMLFormElement = document.getElementById('signin-form') as HTMLFormElement;
const element_login_username : HTMLInputElement = document.getElementById('signin-username') as HTMLInputElement;
const element_login_password : HTMLInputElement = document.getElementById('signin-password') as HTMLInputElement;


element_login_form.addEventListener('submit', (event) => {
    if (!ConnectionManager.isConnected) {
        event.preventDefault();
        return;
    }

    const username = element_login_username.value;
    const password = element_login_password.value;
    const login_data = {
        username: username,
        password: password
    };

    ConnectionManager.send('login', login_data);
    event.preventDefault();
});

ConnectionManager.onDisconnect.subscribe(() => {
    alert('Disconnected from server.\r\nPlease refresh the page to reconnect.');
});

ConnectionManager.onLoginResponse.subscribe((login_response) => {
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
