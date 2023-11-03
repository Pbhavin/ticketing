import nats, { Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

class NatsWrapper {
    private _client?: Stan;

    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url });

        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('Connect to NATS');
                resolve();
            });
            this.client.on('error', (err) => {
                console.log('Cant connect to NATS error : ', err);
                reject(err);
            });
        });
    }

    get client() {
        if (!this._client) {
            throw Error('Cannot access NATS client before connecting!!');
        }
        return this._client;
    }
}

export const natsWrapper = new NatsWrapper();
