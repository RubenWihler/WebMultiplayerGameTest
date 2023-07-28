import Filter from 'bad-words';

export default class BanWord {
    static readonly filter = new Filter();
    
    static clean(text: string): string {
        if (text === undefined || text === null || text.trim().length === 0) return text;
        return BanWord.filter.clean(text);
    }
}