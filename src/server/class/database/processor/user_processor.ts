import { Pool } from "mysql2";
import TokenGenerator from "uuid-token-generator";
import User from "../../connection/connection_types/user.js";
import DatabaseManager from "../database_connection.js";
import HashTools from "../../global_types/hash_tools.js";
import ConnectionData from "../../connection/connection_types/connection_data.js";
import EventsManager from "../../event_system/events_manager.js";

/**
 * The user processor class.
 * This class contains all the methods that are related to user management in the database.
 */
export default class UserProcessor{
    /**
     * Create a new user
     * @param username the username
     * @param email the email
     * @param password the password
     * @returns a promise that contains an object with the statut (true/false) and a connection_data
     */
    static async createUserAsync(username: string, email: string, password: string) : Promise<any>{
        
        let error_messages : string[] = [];

        //checks
        if (!this.isEmailValid(email)){
            error_messages.push("EMAIL_INVALID");
        }
        if (password.length < 5){
            error_messages.push("PASSWORD_TOO_SHORT");
        }
        if (username.length > 20){
            error_messages.push("USERNAME_TOO_LONG");
        }
        if (username.length < 3){
            error_messages.push("USERNAME_TOO_SHORT");
        }
        if (await this.isEmailExist(email)){
            error_messages.push("EMAIL_ALREADY_EXISTS");
        }

        if (error_messages.length > 0){
            return {
                statut: false,
                msg: error_messages
            };
        }
        
        const pool : Pool = DatabaseManager.Pool;
        const query = "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)";
        const queryValues = [
            username,
            email,
            HashTools.hash(password)
        ];
        const [result] : any = await pool.promise().query(query, queryValues);

        if (result.affectedRows == 0){
            return {
                statut: false,
                msg: ["An error occured while creating the user"]
            };
        }

        const user = new User(
            result.insertId,
            username,
            email
        );

        const token = this.generateToken();
        await this.setUserTokenAsync(user.userId, token);
        
        const connection_data = new ConnectionData(
            token,
            user
        );

        EventsManager.onUserCreated.notify(connection_data);


        return {
            statut: true,
            connection: connection_data
        };
    }
    /**
     * Get the user's data by his id, if the user doesn't exist, return an object with the statut false and a message
     * if the user exist, return an object with the statut true and the user's data
     * @param userId the id of the user
     * @returns An object with the statut false and a message
     * if the user exist, return an object with the statut true and the user's data
     */
    static async getUserAsync(userId: number) : Promise<any>{
        const pool : Pool = DatabaseManager.Pool;
        const query = "SELECT * FROM Users WHERE userId = ?";
        const queryValues = [
            userId
        ];
        const [rows] : any = await pool.promise().query(query, queryValues);

        if (rows.length == 0){
            return {
                statut: false,
                msg: ["threre is no user with the id " + userId + "!"]
            };
        }

        return {
            statut: true,
            user: new User(
                rows[0].userId,
                rows[0].username,
                rows[0].email
            )
        };
    }
    /**
     * Try sign in a user. If the email/username or the password is incorrect, return an object with the statut false and a message
     * If the sign in is successful, return an object with the statut true and a connection_data.
     * @param emailOrUsername the email or the username
     * @param password the password
     * @returns the statut and the connection_data
     */
    static async signInAsync(emailOrUsername: string, password: string) : Promise<any>{
        const pool : Pool = DatabaseManager.Pool;
        const query = "SELECT * FROM Users WHERE email = ? OR username = ? LIMIT 1";
        const queryValues = [emailOrUsername, emailOrUsername];
        const [rows] : any = await pool.promise().query(query, queryValues);
        
        if (rows.length == 0 || !HashTools.compareHash(password, rows[0].password)){
            return {
                statut: false,
                msg: ["WRONG_CREDENTIALS"]
            };
        }

        const user = new User(
            rows[0].userId,
            rows[0].username,
            rows[0].email
        );

        const token = this.generateToken();
        if (!(await this.setUserTokenAsync(user.userId, token))){
            return {
                statut: false,
                msg: ["UNKNOWN_ERROR"]
            };
        }

        const connection_data = new ConnectionData(
            token,
            user
        );

        EventsManager.onUserLogin.notify(connection_data);

        return {
            statut: true,
            connection_data: connection_data
        };
    }
    /**
     * Sign in a user with a token and a username. 
     * @param username the username of the user
     * @param token the token of the user
     * @returns If the token or the username is incorrect, return an object with the statut false and a message
     * If the sign in is successful, return an object with the statut true and a connection_data.
     */
    static async signinWithTokenAsync(username:string, token: string) : Promise<any>{
        const pool : Pool = DatabaseManager.Pool;
        const query = "SELECT * FROM Users WHERE username = ? AND token = ? LIMIT 1";
        const queryValues = [username, token];
        const [rows] : any = await pool.promise().query(query, queryValues);
        
        if (rows.length == 0){
            return {
                statut: false,
                msg: ["the token or the username is incorrect"]
            };
        }

        const user = new User(
            rows[0].userId,
            rows[0].username,
            rows[0].email
        );

        const connection_data = new ConnectionData(
            token,
            user
        );

        EventsManager.onUserLogin.notify(connection_data);

        return {
            statut: true,
            connection_data: connection_data
        };
    }
    /**
     * sign out a user from his id. If the user doesn't exist, return an object with the statut false and a message
     * If the sign out is successful, return an object with the statut true
     * @param userId the id of the user to sign out
     * @returns An object with the statut false and a message
     * If the sign out is successful, return an object with the statut true
     */
    static async signOutAsync(userId : number) : Promise<any>{
        const pool : Pool = DatabaseManager.Pool;
        const query = "SELECT * FROM Users WHERE userId = ? LIMIT 1";
        const queryValues = [userId];
        const [rows] : any = await pool.promise().query(query, queryValues);
        
        if (rows.length == 0){
            return {
                statut: false,
                msg: ["an error occured"]
            };
        }

        const user = new User(
            rows[0].userId,
            rows[0].username,
            rows[0].email
        );

        //setting the token to null
        if (!(await this.setUserTokenAsync(user.userId, ""))){
            return {
                statut: false,
                msg: ["an error occured"]
            };
        }

        EventsManager.onUserLogout.notify(user);

        return {
            statut: true
        };
    }

    /**
     * Delete a user from his id.
     * @param userId the id of the user to delete
     * @returns If the user doesn't exist, return an object with the statut false and a message
     * If the user is deleted, return an object with the statut true
     */
    static async deleteUserAsync(userId: number, password: string) : Promise<any>{

        const pool : Pool = DatabaseManager.Pool;
        const password_check_query = "SELECT password FROM Users WHERE userId = ? LIMIT 1";
        const password_check_queryValues = [userId];
        const [rows] : any = await pool.promise().query(password_check_query, password_check_queryValues);
        
        if (rows.length === 0){
            return {
                statut: false,
                msg: ["USER_DOESNT_EXIST"]
            };
        }
        if (!HashTools.compareHash(password, rows[0].password)){
            return {
                statut: false,
                msg: ["WRONG_CREDENTIALS"]
            };
        }

        const query = "DELETE FROM Users WHERE userId = ?";
        const queryValues = [userId];
        const result : any = await pool.promise().query(query, queryValues);
        
        if (result[0].affectedRows == 0){
            return {
                statut: false,
                msg: ["DATABASE_ERROR"]
            };
        }

        EventsManager.onUserDeleted.notify(userId);

        return {
            statut: true
        };
    }

    /**
     * Check if the user's token is correct.
     * @param userId the id of the user
     * @param token the token to test
     */
    static async checkUserTokenAsync(userId: number, token: string) : Promise<Boolean>{
        const pool : Pool = DatabaseManager.Pool;
        const query = "SELECT * FROM Users WHERE userId = ? AND token = ?";
        const queryValues = [userId, token];
        const [rows] : any = await pool.promise().query(query, queryValues);
        return rows.length > 0;
    }

    /**
     * Update the token of a user from his id.
     * @warning ! There is no check if the user exist !
     * @param userId the id of the user
     * @param token the new token of the user
     * @returns If the token is updated, return true
     */
    private static async setUserTokenAsync(userId: number, token: string) : Promise<Boolean>{
        if (token.length === 0) token = null;
        const pool : Pool = DatabaseManager.Pool;
        const token_query = "UPDATE Users SET token = ? WHERE userId = ?";
        const token_query_values = [token, userId];
        const result : any = await pool.promise().query(token_query, token_query_values);
        return result[0].affectedRows > 0;
    }
    /**
     * Check if the email format is valid.
     * @param email Email to check
     * @returns if the email is valid
     */
    private static isEmailValid(email: string) : Boolean{
        const expression: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        return expression.test(email);
    }
    /**
     * Return if the email is already used or not
     * @param email the email to check
     * @returns if the email is already used or not
     */
    private static async isEmailExist(email: string) : Promise<Boolean>{
        const pool : Pool = DatabaseManager.Pool;
        const query = "SELECT userId FROM Users WHERE email = ?";
        const queryValues = [email];
        const [rows] : any = await pool.promise().query(query, queryValues);

        return rows.length > 0;
    }
    /**
     * Return if the username is already used or not
     * @param username the username to check
     * @returns if the username is already used or not
     */
    private static async isUsernameExist(username: string) : Promise<Boolean>{
        const pool : Pool = DatabaseManager.Pool;
        const query = "SELECT userId FROM Users WHERE username = ?";
        const queryValues = [username];
        const [rows] : any = await pool.promise().query(query, queryValues);

        return rows.length > 0;
    }
    /**
     * Generate a random token. The token is 256 bits ling and is encoded in base 62.
     * @returns the generated token
     */
    private static generateToken() : string{
        const generator = new TokenGenerator(256, TokenGenerator.BASE62);
        return generator.generate();
    }
}