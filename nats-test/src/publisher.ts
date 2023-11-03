import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-create-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222',
});

stan.on('connect', async () => {
    console.log('publisher is connected to NATS');

    const publisher = new TicketCreatedPublisher(stan);
    try {
        await publisher.publish({
            id: 'abc',
            title: 'kumar sanu',
            price: 100,
            userId: '1234',
        });
    } catch (err) {
        console.error(err);
    }
});
