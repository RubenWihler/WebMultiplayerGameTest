import ConnectionHandler from "../../../../connection/connection_handler.js";
import EngineConfig from "../../engine_config.js";
import PlayerInputManager from "../../managers/player_input_manager.js";
import Direction from "../../types/direction.js";
import PlayerMovementType from "../../types/player_movement_type.js";
import Position from "../../types/position.js";
import Size from "../../types/size.js";
import Entity from "./entity.js";

export default class Player extends Entity{
    protected _local_id: number = -1;
    protected _connectionHandler: ConnectionHandler;
    protected _color: number;
    protected _speed: number;
    protected _input_manager: PlayerInputManager;
    protected _player_movement_type: PlayerMovementType;
    protected _spawn_position: Position;

    //cached values
    private ___widthDividedByTwo: number;
    private ___heightDividedByTwo: number;

    /**
     * the user id of the player
     */
    public get id(): number {
        return this._connectionHandler.connection_data.user.userId;
    }

    public get localId(): number {
        return this._local_id;
    }
    public set localId(value: number) {
        this._local_id = value;
    }

    public get connectionHandler(): ConnectionHandler {
        return this._connectionHandler;
    }

    public get color(): number {
        return this._color;
    }
    public set color(value: number) {
        this._color = value;
    }

    public get movementType(): PlayerMovementType {
        return this._player_movement_type;
    }
    public set movementType(value: PlayerMovementType) {
        this._player_movement_type = value;
    }

    public get spawnPosition(): Position {
        return this._spawn_position;
    }
    public set spawnPosition(value: Position) {
        this._spawn_position = value;
    }

    public get size(): Size {
        return this._size;
    }
    public set size(value: Size) {
        this._size = value;
    }
    
    constructor(connectionHandler: ConnectionHandler, spawnPosition: Position, size: Size, speed: number){
        super("player", spawnPosition, size);
        this._speed = speed;
        this._spawn_position = spawnPosition;
        this._connectionHandler = connectionHandler;
        this._player_movement_type = PlayerMovementType.Horizontal;
        this._input_manager = new PlayerInputManager(this._connectionHandler);
        this.___widthDividedByTwo = this._size.width / 2;
        this.___heightDividedByTwo = this._size.height / 2;
    }

    public init(): void {
        this._input_manager.init();
    }
    public start(): void {
        super.start();
    }
    public update(): void {
        if (this.tryMove(this._input_manager.movingDirection)){
            this.checkOutOfBounds();
        }
    }
    public destroy(): void {
        this._input_manager.destroy();
    }

    public tpToSpawn(): void {
        this._position = this._spawn_position;
    }

    protected tryMove(direction: Direction): boolean{
        if (direction == Direction.NONE) return false;
        this.move(direction);
        return true;
    }
    protected move(direction: Direction){
        const current_pos = this.position;
        let delta_x = 0;
        let delta_y = 0;

        if (this._player_movement_type == PlayerMovementType.Horizontal){
            delta_x = this._speed * direction;
        }
        else if (this._player_movement_type == PlayerMovementType.Vertical){
            delta_y = this._speed * direction;
        }   

        // Calculate the new x and y positions
        const new_x = current_pos.x + delta_x;
        const new_y = current_pos.y + delta_y;

        // Update the position
        this._position = {x: new_x, y: new_y};
    }

    protected checkOutOfBounds(): void {
        if (this._player_movement_type == PlayerMovementType.Horizontal){
            if (this._position.x < 0) this._position.x = 0;
            else if (this._position.x > EngineConfig.TERRAIN_MATRIX_SIZE.x - this.width) this._position.x = EngineConfig.TERRAIN_MATRIX_SIZE.x - this.width;
        }
        else if (this._player_movement_type == PlayerMovementType.Vertical){
            if (this._position.y < 0) this._position.y = 0;
            else if (this._position.y > EngineConfig.TERRAIN_MATRIX_SIZE.y - this.height) this._position.y = EngineConfig.TERRAIN_MATRIX_SIZE.y - this.height;
        }
    }
}