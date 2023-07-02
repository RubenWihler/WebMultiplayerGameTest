import express from 'express';
import path from 'path';

const __dirname = path.resolve(); // [...]/WebMultiplayerGameTest/dist
const router = express.Router();

// router.get('/', function (req, res) {
//     res.sendFile(__dirname + '/client/index.html');
// });

// router.get('/client', function (req, res) {
//     res.sendFile(__dirname + '/client/index.html');
// });

router.use('/', express.static(__dirname + '/client'));

export { router, __dirname };