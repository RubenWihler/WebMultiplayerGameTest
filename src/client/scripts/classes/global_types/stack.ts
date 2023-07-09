/**
 * A custom stack implementation.
 * @template T the type of the stack
 * @class Stack
 * @constructor Creates an empty stack
 */
export default class Stack<T>{
    //helped by https://www.geeksforgeeks.org/implementation-stack-javascript/

    private _items: T[];

    constructor(){
        this._items = [];
    }

    /**
     * Returns the size of the stack
     */
    public get size(): number{
        return this._items.length;
    }

    /**
     * Returns true if the stack is empty
     */
    public get isEmpty(): boolean{
        return this.size === 0;
    }

    /**
     * Returns the items of the stack
     */
    public get items(): readonly T[]{
        return this._items as readonly T[];
    }

    /**
     * Pushes the given item to the stack
     * @param item the item to push
     */
    push(item: T): void{
        this._items.push(item);
    }

    /**
     * Pops the last item of the stack and returns it
     * @returns the last item of the stack or null if the stack is empty
     */
    pop(): T {
        if(this.isEmpty) return null;
        return this._items.pop();
    }

    /**
     * Returns the last item of the stack without removing it
     * @returns the last item of the stack or null if the stack is empty
     */
    peek(): T{
        if(this.isEmpty) return null;
        return this._items[this._items.length - 1];
    }

    /**
     * Returns the a string representation of the stack
     * @example "[1, 2, 3]"
     * @returns the a string representation of the stack
     */
    public toString(): string{
        let str = "[";

        this._items.forEach(item => {
            str += item.toString() + ", ";
        });

        str += "]";

        return str;
    }

    /**
     * Clears the stack
     */
    clear(): void{
        this._items = [];
    }
}