import SocketManager from "../class/connection/socket_manager.js";

export function setUpListeningMessages(){
    SocketManager.listenMessage('test', (socket, data) => {
        console.log('test received from ' + socket.id + ' data: ' + JSON.stringify(data));
    });
}