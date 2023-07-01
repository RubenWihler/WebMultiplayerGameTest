import ObservableEvent from "./observable_event.js";
import User from "./user.js";
import ConnectionData from "./connection_data.js";

export default class EventsManager {
    public static readonly onUserCreated : ObservableEvent<ConnectionData> = new ObservableEvent();
    public static readonly onUserLogin : ObservableEvent<ConnectionData> = new ObservableEvent();
    public static readonly onUserLogout : ObservableEvent<User> = new ObservableEvent();

}