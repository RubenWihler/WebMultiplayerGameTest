import ObservableEvent from "../global_types/observable_event.js";

enum SettingsType{
    TEXT,
    NUMBER,
    BOOLEAN,
    PASSWORD,
    SELECT,
    COLOR,
    FILE
}

class Setting{
    public readonly name: string;
    public readonly type: SettingsType;
    public readonly constraints: SettingConstraint[];    
    public readonly onValueChanged: ObservableEvent<any>;
    private _value: any;

    constructor(name: string, type: SettingsType, constraints: SettingConstraint[], value: any){
        this.name = name;
        this.type = type;
        this._value = value;

        this.constraints = constraints == undefined || constraints == null ? [] : constraints;
        this.onValueChanged = new ObservableEvent<any>();
    }

    public get value(): any{
        return this._value;
    }

    public set value(value: any){
        if (this.checkConstraints(value)){
            this._value = value;
            this.onValueChanged.notify(value);
        }
    }

    public checkConstraints(value: any): boolean{
        if (this.constraints.length === 0) return true;

        return this.constraints.every(c => c.check(value));
    }

    public getConstraint(name: string): SettingConstraint{
        let result = null;

        this.constraints.forEach(c => {
            c.constraintsDictionary.forEach(d => {
                if (d.name.localeCompare(name) == 0){
                    console.log(`Founded constraint ${name} in ${c}!`);
                    result = c;
                    return;
                }
            });
            if (result != null) return;
        });

        return result;
    }
}

//#region Setting Constraints System

class SettingConstraint{

    //#region static predefined constraints

    //#region number constraints

    public static NUMBER_RANGE(min: number, max: number) : SettingConstraint{
        return new NumberRangeConstraintBuilder(min, max).build();
    }

    public static NUMBER_MIN(min: number) : SettingConstraint{
        return new NumberRangeConstraintBuilder(min, Number.MAX_SAFE_INTEGER).build();
    }

    public static NUMBER_MAX(max: number) : SettingConstraint{
        return new NumberRangeConstraintBuilder(Number.MIN_SAFE_INTEGER, max).build();
    }

    //#endregion

    //#region text constraints

    public static TEXT_RANGE(min: number, max: number) : SettingConstraint{
        return new TextRangeConstraintBuilder(min, max).build();
    }

    public static TEXT_MIN_LENGTH(min: number) : SettingConstraint{
        return new TextRangeConstraintBuilder(min, Number.MAX_SAFE_INTEGER).build();
    }

    public static TEXT_MAX_LENGTH(max: number) : SettingConstraint{
        return new TextRangeConstraintBuilder(0, max).build();
    }

    //#endregion

    //#region password constraints

    public static PASSWORD_RANGE(min: number, max: number) : SettingConstraint{
        return new TextRangeConstraintBuilder(min, max)
            .setTargetType(SettingsType.PASSWORD)
            .build();
    }

    public static PASSWORD_MIN_LENGTH(min: number) : SettingConstraint{
        return new TextRangeConstraintBuilder(min, Number.MAX_SAFE_INTEGER)
            .setTargetType(SettingsType.PASSWORD)
            .build();
    }

    public static PASSWORD_MAX_LENGTH(max: number) : SettingConstraint{
        return new TextRangeConstraintBuilder(0, max)
            .setTargetType(SettingsType.PASSWORD)
            .build();
    }

    //#endregion

    //#endregion

    public readonly type: SettingsType;
    public readonly constraintsDictionary: {name: string, value: any}[];
    public readonly checkFunction: (constraint: SettingConstraint, value: any) => boolean;

    constructor(type: SettingsType, constraintsDictionary: {name: string, value: any}[], checkFunction: (constraint: SettingConstraint, value: any) => boolean){
        this.type = type;
        this.constraintsDictionary = constraintsDictionary;
        this.checkFunction = checkFunction;
    }

    public check(value: any): boolean{
        return this.checkFunction(this, value);
    }

    public getValue(name: string): any{
        const constraint = this.constraintsDictionary.find(c => c.name === name);
        if (constraint === undefined) console.warn(`[!] Constraint ${name} not found!`);
        return constraint.value;
    }
}

//#region Setting Constraint Builders

class SettingConstraintBuilder{
    private _targetType: SettingsType;
    private _constraintsDictionary: {name: string, value: number}[];
    private _checkFunction: (constraint: SettingConstraint, value: any) => boolean;

    constructor(){
        this._targetType = null;
        this._constraintsDictionary = [];
        this._checkFunction = (value) => {
            console.warn(`[!] No check function defined for constraint ${value}!`);
            return true;
        };
    }

    public setTargetType(value: SettingsType): SettingConstraintBuilder{
        this._targetType = value;
        return this;
    }

    public build(): SettingConstraint{
        if (this._targetType === null){
            console.warn('[!] Target type not defined for a constraint!');
            return null;
        }

        return new SettingConstraint(
            this._targetType,
            this._constraintsDictionary,
            this._checkFunction
        );
    }

    public addField(name: string, value: any): SettingConstraintBuilder {
        this._constraintsDictionary.push({name: name, value: value});
        return this;
    }

    public setCheckFunction(checkFunction: (constraint: SettingConstraint, value: any) => boolean): SettingConstraintBuilder{
        this._checkFunction = checkFunction;
        return this;
    }
}

class NumberRangeConstraintBuilder extends SettingConstraintBuilder{
    constructor(min: number, max: number){
        super();
        this.setTargetType(SettingsType.NUMBER);
        this.addField('min', min);
        this.addField('max', max);
        this.setCheckFunction((constraint, value) => {
            return value > constraint.getValue('min') 
                && value < constraint.getValue('max');
        });
    }
}
class TextRangeConstraintBuilder extends SettingConstraintBuilder{
    constructor(min: number, max: number){
        super();
        this.setTargetType(SettingsType.TEXT)
            .addField('min', min)
            .addField('max', max)
            .setCheckFunction((constraint, value: string) => {
                return value.length > constraint.getValue('min') 
                    && value.length < constraint.getValue('max');
            });
    }
}

//#endregion

//#endregion

export {
    SettingsType,
    Setting,
    SettingConstraint
};