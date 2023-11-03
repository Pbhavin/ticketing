import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import mongoose from 'mongoose';
import { TicketCreatedListener } from './events/listners/ticket-created-listener';
import { TicketUpdatedListner } from './events/listners/ticket-updated-listener';
import { ExpireCompleteListner } from './events/listners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listners/payment-created-listener';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT KEY Needs to be defined!!');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO URI Needs to be defined!!');
    }
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

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListner(natsWrapper.client).listen();
        new ExpireCompleteListner(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();

        console.log('Starting Orders-DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Orders-DB started.');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log(`Listening on port 3000!!`);
    });
};

start();
