import ObservableEvent from "../global_types/observable_event.js";

/**
 * Class that represents a view.
 * @see ViewsManager
 */
export default class View {
    /**
     * The name of the view. (wihout #) 
     * This is the same as the id of the element.
     */
    public readonly name: string;
    /**
     * The name that will be used in the url
     */
    public readonly url_name: string;
    /**
     * The name of the page to display in the title bar
     */
    public readonly page_display_name: string;
    /**
     * The style display mode that will be used to display the view (flex, block, etc.)
     */
    public readonly display_mode: string;
    /**
     * The element that will be displayed
     */
    public element: HTMLDivElement;

    /**
     * Event that is called when the view is displayed
     */
    public readonly onDisplay: ObservableEvent<View>;
    /**
     * Event that is called when the view is hidden
     */
    public readonly onHide: ObservableEvent<View>;

    private active: boolean;

    /**
     * Is the view that is currently displayed/active
     */
    public get isActive(): boolean {
        return this.active;
    }

    constructor(name: string, urlName:string = '', pageDisplayName:string = '', display_mode: string = "flex") {
        if (urlName == null || urlName == undefined || urlName.length == 0){
            urlName = name.toLowerCase().replace(' ', '-').replace('_', '-');
        }
        if (pageDisplayName == null || pageDisplayName == undefined || pageDisplayName.length == 0){
            const clean_name = name.replace('_', ' ').replace('-', ' ').toLowerCase();
            const first_letter = clean_name[0].toUpperCase();
            pageDisplayName = first_letter + clean_name.slice(1);
        }

        this.name = name;
        this.display_mode = display_mode;
        this.url_name = urlName;
        this.page_display_name = pageDisplayName;
        this.onDisplay = new ObservableEvent<View>();
        this.onHide = new ObservableEvent<View>();
        this.element = document.getElementById(this.name) as HTMLDivElement;
        //will be set just after in the hide() method
        this.active = true;

        this.hide();
    }

    /**
     * Display the view.
     * @warning This does not hide the previous view !
     */
    public display(): void {
        if (this.active) return;
        this.active = true;
        this.element.style.display = this.display_mode;
        this.element.style.visibility = "visible";
        this.onDisplay.notify(this);
    }

    /**
     * Hide the view.
     */
    public hide(): void {
        if (!this.active) return;
        this.active = false;
        this.element.style.display = "none";
        this.element.style.visibility = "hidden";
        this.onHide.notify(this);
    }
}