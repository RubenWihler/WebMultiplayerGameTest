import ObservableEvent from "./observable_event.js";
import User from "../connection/connection_types/user.js";
import ConnectionData from "../connection/connection_types/connection_data.js";

export default class EventsManager {
    public static readonly onUserCreated : ObservableEvent<ConnectionData> = new ObservableEvent();
    public static readonly onUserDeleted : ObservableEvent<number> = new ObservableEvent();
    public static readonly onUserLogin : ObservableEvent<ConnectionData> = new ObservableEvent();
    public static readonly onUserLogout : ObservableEvent<User> = new ObservableEvent();

}