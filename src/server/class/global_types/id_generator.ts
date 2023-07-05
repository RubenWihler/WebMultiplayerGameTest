export default class IdGenerator {
    //generates random id;
    public static generate(): string{
        //took from https://learnersbucket.com/examples/javascript/unique-id-generator-in-javascript/
        //generates random string of 4 characters
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
}