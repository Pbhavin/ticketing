import { Listener, OrderCreatedEvent, Subjects } from '@bpticketproject/common';
import { Message } from 'node-nats-streaming';
import { queGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queGroupName = queGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expireAt).getTime() - new Date().getTime();
        console.log('Waiting this many milliseconds to process job', delay);
        await expirationQueue.add({ orderId: data.id }, { delay });
        msg.ack();
    }
}
