import mysql from 'mysql2';
import dotenv from 'dotenv';
import { Pool } from 'mysql2/typings/mysql/lib/Pool';
import UserProcessor from './processor/user_processor';

export default class DatabaseManager{
    private static pool: Pool;

    public static get Pool(){
        if (DatabaseManager.pool == null){
            DatabaseManager.initialize();
        }
        return DatabaseManager.pool;
    }

    static initialize(){
        dotenv.config();

        this.pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });

        // Initialize processors
        UserProcessor.init();
    }
}