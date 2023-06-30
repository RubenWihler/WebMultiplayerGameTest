//to remove in the javascript file
import io from 'socket.io-client';

var socket = io();

var canvas : HTMLCanvasElement = document.querySelector('#ctx');
var ctx = canvas.getContext('2d');

console.log('Client started.');

socket.on('connect', function () {
    console.log('socket connection');
});

socket.on('update', function (data) {
    console.log(data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';

    for (var i in data) {
        var player = data[i];
        ctx.fillRect(player.position.x, player.position.y, 50, 50);
        ctx.fillText(player.name, player.position.x + 20, player.position.y -5);
    }
});