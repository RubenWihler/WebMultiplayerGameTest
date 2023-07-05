import Filter from 'bad-words';

export default class BanWord {
    static readonly filter = new Filter();
    
    static clean(text: string): string {
        return BanWord.filter.clean(text);
    }
}