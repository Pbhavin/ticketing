import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
    if (!process.env.NATS_URL) {
        throw new Error('NATS URL Needs to be defined!!');
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS CLUSTER ID to be defined!!');
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS CLIENT ID to be defined!!');
    }
    try {
        console.log('Trying to Connect to NATS..');
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );
        console.log('Connected to NATS');

        natsWrapper.client.on('close', () => {
            console.log('STAN connection closing..');
            process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.error(err);
    }
};

start();
