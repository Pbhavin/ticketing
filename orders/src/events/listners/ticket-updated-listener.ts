import {
    Listener,
    Subjects,
    TicketUpdatedEvent,
} from '@bpticketproject/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../model/ticket';
import { queGroupName } from './queue-group-name';

export class TicketUpdatedListner extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queGroupName = queGroupName;
    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new Error('Ticket Not Found');
        }
        const { title, price } = data;
        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}
