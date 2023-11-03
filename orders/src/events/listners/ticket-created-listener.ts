import {
    Listener,
    Subjects,
    TicketCreatedEvent,
} from '@bpticketproject/common';
import { Message } from 'node-nats-streaming';
import { queGroupName } from './queue-group-name';
import { Ticket } from '../../model/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queGroupName = queGroupName;
    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const ticket = Ticket.build({
            id: data.id,
            title: data.title,
            price: data.price,
        });
        await ticket.save();
        msg.ack();
    }
}
