import mysql from 'mysql2';
import { Pool } from 'mysql2/typings/mysql/lib/Pool';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'ruben',
    password: 'wihler',
    database: 'Multiplayer_Game_DB'
}).promise();

const result = pool.query('SELECT * FROM users');