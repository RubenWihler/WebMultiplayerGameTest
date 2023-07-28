import { SettingsType, Setting } from "../../settings/settings_system.js";

export default class SettingsElement{
    private _element: HTMLElement;
    private _setting: Setting;
    private _readonly: boolean;

    constructor(setting: Setting, readonly: boolean){
        this._setting = setting;
        this._readonly = readonly;
        this._element = this.createElement();
    }

    public get element(): HTMLElement{
        return this._element;
    }

    public get setting(): Setting{
        return this._setting;
    }

    private createElement(): HTMLElement{
        const element = document.createElement('div');
        element.classList.add('lobby-setting-container');

        const name = document.createElement('span');
        name.innerText = `${this._setting.name} :`;

        let input: HTMLInputElement|HTMLButtonElement;

        switch(this._setting.type){
            case SettingsType.BOOLEAN:
                element.classList.add('toogle');
                input = document.createElement('button');
                input.innerHTML = this._setting.value ?
                    '<i class="fas fa-toggle-on"></i>' :
                    '<i class="fas fa-toggle-off"></i>';
                    
                input.addEventListener('click', () => {
                    this._setting.value = !this._setting.value;
                    this.update();
                });
                break;

            case SettingsType.NUMBER:
                element.classList.add('number');
                input = document.createElement('input');
                input.type = 'number';
                input.value = this._setting.value;
                input.addEventListener('blur', () => {
                    this._setting.value = input.value;
                    this.update();
                });
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter'){
                        input.blur();
                    }
                });
                input.addEventListener('change', (e) => {
                    element.classList.toggle('error', !this._setting.checkConstraints(input.value));
                });

                if (this._setting.constraints !== undefined){
                    const min = this._setting.getConstraint('min');
                    const max = this._setting.getConstraint('max');

                    if (min !== null) input.min = min.getValue('min') + 1;
                    if (max !== null) input.max = Number(max.getValue('max') - 1).toString();
                }

                break;
            
            case SettingsType.TEXT:
                element.classList.add('text');
                input = document.createElement('input');
                input.type = 'text';
                input.value = this._setting.value;
                input.addEventListener('blur', () => {
                    this._setting.value = input.value;
                    this.update();
                });
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter'){
                        input.blur();
                        e.preventDefault();
                        return;
                    }

                    element.classList.toggle('error', !this._setting.checkConstraints(input.value));
                });

                if (this._setting.constraints !== undefined){
                    const min = this._setting.getConstraint('min');
                    const max = this._setting.getConstraint('max');

                    if (min !== null) input.minLength = min.getValue('min') + 1;
                    if (max !== null) input.maxLength = max.getValue('max') - 1;
                }

                break;

            case SettingsType.PASSWORD:
                element.classList.add('password');
                input = document.createElement('input');
                input.type = 'password';
                input.value = this._setting.value;
                input.addEventListener('blur', () => {
                    this._setting.value = input.value;
                    this.update();
                });
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter'){
                        input.blur();
                        e.preventDefault();
                        return;
                    }

                    element.classList.toggle('error', !this._setting.checkConstraints(input.value));
                });

                if (this._setting.constraints !== undefined){
                    const min = this._setting.getConstraint('min');
                    const max = this._setting.getConstraint('max');

                    if (min !== null) input.minLength = min.getValue('min') + 1;
                    if (max !== null) input.maxLength = max.getValue('max') - 1;
                }

                break;
                
            
            default:
                console.warn(`[!] Unknown setting type ${this._setting.type}!`);
                break;
        }

        if (this._readonly){
            element.classList.add('readonly');
            input.setAttribute('disabled', 'true');
        }

        element.appendChild(name);
        element.appendChild(input);

        return element;
    }

    public update(): void{
        let input: HTMLInputElement|HTMLButtonElement;

        switch(this._setting.type){
            case SettingsType.BOOLEAN:
                input = this._element.querySelector('button');
                input.innerHTML = this._setting.value ?
                    '<i class="fas fa-toggle-on"></i>' :
                    '<i class="fas fa-toggle-off"></i>';
                
                break;
                    
            default:
                input = this._element.querySelector('input');
                input.value = this._setting.value;
                break;
        }

        this._element.classList.toggle('error', !this._setting.checkConstraints(input.value));
    }
}