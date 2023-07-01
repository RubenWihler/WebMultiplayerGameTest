import { Pool } from "mysql2";
import TokenGenerator from "uuid-token-generator";
import User from "../../class/user.js";
import DatabaseManager from "../database_connection.js";
import HashTools from "../hash_tools.js";
import ConnectionData from "../../class/connection_data.js";
import EventsManager from "../../class/events_manager.js";

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
            error_messages.push("the email is not valid");
        }
        if (password.length < 5){
            error_messages.push("the password must be at least 5 characters long");
        }
        if (username.length < 3){
            error_messages.push("the username must be at least 3 characters long");
        }
        if (await this.isEmailExist(email)){
            error_messages.push("the email is already used");
        }
        if (await this.isUsernameExist(username)){
            error_messages.push("the username is already used");
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
            HashTools.convertToHash(password)
        ];
        const [result] : any = await pool.promise().query(query, queryValues);

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
                msg: ["the email/username or the password is incorrect"]
            };
        }

        const user = new User(
            rows[0].userId,
            rows[0].username,
            rows[0].email
        );

        const token = this.generateToken();
        await this.setUserTokenAsync(user.userId, token);

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
        await this.setUserTokenAsync(user.userId, "");

        EventsManager.onUserLogout.notify(user);

        return {
            statut: true
        };
    }

    /**
     * Update the token of a user from his id.
     * @warning ! There is no check if the user exist !
     * @param userId the id of the user
     * @param token the new token of the user
     */
    private static async setUserTokenAsync(userId: number, token: string) : Promise<void>{
        if (token.length === 0) token = null;
        const pool : Pool = DatabaseManager.Pool;
        const token_query = "UPDATE Users SET token = ? WHERE userId = ?";
        const token_query_values = [token, userId];
        const result = await pool.promise().query(token_query, token_query_values);
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