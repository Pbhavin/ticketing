import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-create-listener';
import { TicketUpdatedListener } from './events/ticket-update-listener';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222',
});

stan.on('connect', () => {
    console.log('Listener is connected to NATS !!');
    stan.on('close', () => {
        console.log('STAN connection closing..');
        process.exit();
    });

    new TicketCreatedListener(stan).listen();
    new TicketUpdatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
