import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
    static async toHash(password: string) {
        const salt = randomBytes(8).toString('hex');
        const buff = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${buff.toString('hex')}.${salt}`;
    }

    static async compare(storedPass: string, suppliedPass: string) {
        const [hashPass, salt] = storedPass.split('.');
        const buff = (await scryptAsync(suppliedPass, salt, 64)) as Buffer;
        return buff.toString('hex') === hashPass;
    }
}
