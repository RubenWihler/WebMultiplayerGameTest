import password_hash from 'password_hash';

export default class HashTools{
    public static hash(password: string) : string{
        const salt = password_hash().salt();
        const hash = password_hash(password).hash(salt);
        return hash;
    }

    public static compareHash(password: string, hash: string) : boolean{
        return password_hash(password).verify(hash);
    }
}
