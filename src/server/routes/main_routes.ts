import express from 'express';
import path from 'path';

const __dirname = path.resolve(); // [...]/WebMultiplayerGameTest/dist
const router = express.Router();

router.use('/', express.static(__dirname + '/client'));

export { router, __dirname };