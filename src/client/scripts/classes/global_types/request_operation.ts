import ConnectionManager from "../connection/connection_manager.js";
import ObservableEvent from "./observable_event.js";

/**
 * A request operation is a request that is sent to the server and waits for a response.
 */
export default class RequestOperation<SendType, ResponseType> {
    public readonly send_message_name: string;
    public readonly receive_message_name: string;
    public readonly send_data: SendType;
    public readonly timeout_duration: number;
    public response_data: ResponseType;
    public waiting_for_response: Boolean;
    private timeout: NodeJS.Timeout|null = null;

    /**
     * Called when the operation starts
     */
    public onStart: ObservableEvent<SendType>;
    /**
     * Called when the operation receives a response.
     */
    public onReceive: ObservableEvent<ResponseType>;
    /**
     * Called when the operation finishes. (Either by receiving a response or by timing out)
     */
    public onFinished: ObservableEvent<void>;
    /**
     * Called when the operation times out.
     */
    public onTimeout: ObservableEvent<void>;
    /**
     * Called when the operation as been forced to stop.
     */
    public onStop: ObservableEvent<string>;


    constructor(send_message_name: string, receive_message_name: string, send_data: SendType, timeout: number = 10000,
        onStart: ObservableEvent<SendType> = new ObservableEvent<SendType>(),
        onReceive: ObservableEvent<ResponseType> = new ObservableEvent<ResponseType>(),
        onFinished: ObservableEvent<void> = new ObservableEvent<void>(),
        onTimeout: ObservableEvent<void> = new ObservableEvent<void>(),
        onStop: ObservableEvent<string> = new ObservableEvent<string>()){

        this.send_message_name = send_message_name;
        this.receive_message_name = receive_message_name;
        this.send_data = send_data;
        this.timeout_duration = timeout;
        this.response_data = null;
        this.waiting_for_response = false;

        this.onStart = onStart;
        this.onReceive = onReceive;
        this.onFinished = onFinished;
        this.onTimeout = onTimeout;
        this.onStop = onStop;
    }

    /**
     * Start the operation and wait for the response.
     */
    public async start() : Promise<ResponseType> {
        this.waiting_for_response = true;
        ConnectionManager.send(this.send_message_name, this.send_data);

        //bind response event
        ConnectionManager.Instance.socket.on(this.receive_message_name, (data: ResponseType) => {
            this.response_data = data;
            this.onReceive.notify(data);
        });

        //bind timeout event
        this.timeout = setTimeout(() => {
            this.onTimeout.notify();
        }, this.timeout_duration);

        this.onFinished.subscribe(() => {
            this.dispose();
        });
       
        //wait for stop
        let result = await new Promise<ResponseType>((resolve, reject) => {
            this.onStart.notify(this.send_data);

            //on receive
            this.onReceive.subscribe((data) => {
                if (!this.waiting_for_response) return;
                this.waiting_for_response = false;
                this.onFinished.notify();
                resolve(data);
            });

            //on timeout
            this.onTimeout.subscribe(() => {
                if (!this.waiting_for_response) return;
                this.waiting_for_response = false;
                this.onFinished.notify();
                reject("timeout");
            });

            //on stop
            this.onStop.subscribe((reason) => {
                if (!this.waiting_for_response) return;
                this.waiting_for_response = false;
                this.onFinished.notify();
                reject(reason);
            });
        });

        return result;
    }
    /**
     * Force the operation to stop
     */
    public stop(reason:string = "unknown"){
        this.onStop.notify(reason);
    }

    private dispose(){
        ConnectionManager.Instance.socket.off(this.receive_message_name);
        clearTimeout(this.timeout);
        this.onStart.dispose();
        this.onReceive.dispose();
        this.onFinished.dispose();
        this.onTimeout.dispose();
        this.onStop.dispose();
    }
}