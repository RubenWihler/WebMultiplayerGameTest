import View from "./view.js";

/**
 * Class that manages the views.
 * This class is a singleton. Use ViewsManager.Instance to access the instance.
 * @warning The ViewsManager must be initialized before using it. Use ViewsManager.Initialize(views) to initialize it.
 * @see View
 */
export default class ViewsManager {
    /**
     * The base name of the page that will be displayed in the title bar
     * @example "Multi-Pong | [current view page name]"
     */
    private static readonly BASE_PAGE_NAME = "Multi-Pong";
    private static instance: ViewsManager;
    
    public readonly views: Map<string,View>;

    private active_view: View;

    public static get Instance(): ViewsManager {
        if (!ViewsManager.instance) {
            throw new Error("ViewsManager has not been initialized yet.");
        }

        return ViewsManager.instance;
    }
    /**
     * Get all the views
     */
    public static get views(): readonly View[] {
        return Array.from(ViewsManager.Instance.views.values()) as readonly View[];
    }
    /**
     * Get the active view. This is the view that is currently displayed.
     */
    public static get activeView(): View {
        return ViewsManager.Instance.active_view;
    }

    constructor(views: View[] = []) {
        this.views = new Map<string,View>();
        this.active_view = null;

        // Add the views to the map with the name as the key
        views.forEach(view => {
            this.views.set(view.name, view);
        });

        // On hash change, display the view with the name in the url if it exists
        // If it doesn't exist, display the previous view
        window.addEventListener('hashchange', (e) => {
            const url = e.newURL;
            const index = url.lastIndexOf("#");
            const view_name = url.substring(index + 1);
            if (!ViewsManager.setActiveView(view_name)){
                const old_url_view_name = e.oldURL.substring(e.oldURL.lastIndexOf("#") + 1);
                ViewsManager.setActiveView(old_url_view_name);
            }
        });
        
        // Add a confirmation message when the user tries to leave the page
        // window.addEventListener("beforeunload", function (e) {
        //     var confirmationMessage = "Do you really want to leave? The connection will be lost.";
            
        //     (e || window.event).returnValue = confirmationMessage;
        //     return confirmationMessage;
        // });
    }

    /**
     * Initialize the ViewsManager with the given views.
     * @param views the views to initialize the ViewsManager with
     * @returns the ViewsManager instance
     */
    public static Initialize(views: View[], nameOfViewToDisplay:string = ''): ViewsManager {
        if (ViewsManager.instance) {
            throw new Error("ViewsManager has already been initialized.");
        }

        ViewsManager.instance = new ViewsManager(views);

        // Display the view with the given name if it exists
        if (nameOfViewToDisplay != null && nameOfViewToDisplay != undefined && nameOfViewToDisplay.length > 0){
            ViewsManager.setActiveView(nameOfViewToDisplay);
        }

        return ViewsManager.instance;
    }
    /**
     * Get the view with the given name
     * @param viewName the name of the view to get (without the #)
     * @returns returns the view with the given name or null if it doesn't exist
     */
    public static getViewByName(viewName: string): View {
        const view : View = ViewsManager.Instance.views.get(viewName);
        return view != undefined ? view : null;
    }
    /**
     * Display and set the active view to the view with the given name and hide the previous active view.
     * @param viewName the name of the view to set as active (without the #)
     * @returns if the view was successfully set to active
     */
    public static setActiveView(viewName :string): boolean {
        console.log("Setting active view to " + viewName);

        // If the view is already active, return false
        if (ViewsManager.activeView != null && ViewsManager.activeView.name == viewName) return false;
        
        // Find the view
        const view : View = ViewsManager.getViewByName(viewName);
        
        // If the view doesn't exist, return false
        if (view == undefined){
            console.warn("[!] View " + viewName + " doesn't exist !");
            return false;
        }

        // Hide the active view
        if (ViewsManager.activeView != null){
            ViewsManager.activeView.hide();
        }

        // Display the new view and set it as the active view
        view.display();
        ViewsManager.Instance.active_view = view;

        // Update the url to have the view name as the hash
        this.updateUrl(view);

        // Update the title of the page
        this.updateTitle(view);

        console.log("Active view set to " + viewName);
        return true;
    }

    /**
     * update the url to have the view name as the hash and update the title of the page.
     * @param viewName the name of the view (without the #)
     */
    private static updateUrl(view: View): void {
        var current_url :string = window.location.href;
        let clean_url :string; // current url + #

        if (!current_url.includes("#")){
            clean_url = current_url + "#";
        }
        else{
            const index = current_url.lastIndexOf("#");
            clean_url = current_url.substring(0, index + 1);
        }

        const url = clean_url + view.url_name;
        var obj = { Title: view.url_name, Url: url };
        history.pushState(obj, obj.Title, obj.Url);
    }
    /**
     * Update the title of the page to have the view name in it.
     * @param view the view to update the title with
     */ 
    private static updateTitle(view: View): void {

        let title = ViewsManager.BASE_PAGE_NAME;

        if (view.page_display_name != ' '){
            title += " | " + view.page_display_name;
        }

        document.title = title;
    }
}