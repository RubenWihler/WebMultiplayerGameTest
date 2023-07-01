export default class ObservableEvent<T>{
    observers: ((data:T) => any)[];

    constructor() {
        this.observers = [];
      }
     
    subscribe(func: (data:T) => any) {
        this.observers.push(func);
    }
    
    unsubscribe(func: (data:T) => any) {
        this.observers = this.observers.filter((observer) => observer !== func);
    }
    
    notify(data:T) {
        this.observers.forEach((observer) => observer(data));
    }
}