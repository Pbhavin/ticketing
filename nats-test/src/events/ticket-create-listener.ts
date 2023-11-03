import {
    Listener,
    TicketCreatedEvent,
    Subjects,
} from '@bpticketproject/common';
import { Message } from 'node-nats-streaming';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queGroupName = 'payment-service';
    onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
        console.log('Evnet Data!', data);
        msg.ack();
    }
}
