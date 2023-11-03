import {
    Listener,
    TicketUpdatedEvent,
    Subjects,
} from '@bpticketproject/common';
import { Message } from 'node-nats-streaming';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queGroupName = 'payment-service';
    onMessage(data: TicketUpdatedEvent['data'], msg: Message): void {
        console.log('Evnet Data!', data);
        msg.ack();
    }
}
