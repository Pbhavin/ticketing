import {
    Listener,
    OrderCancelledEvent,
    Subjects,
} from '@bpticketproject/common';
import { queGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queGroupName = queGroupName;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('Ticket Not Found');
        }

        ticket.set({ orderID: undefined });
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userID,
            orderId: ticket.orderID,
            version: ticket.version,
        });

        msg.ack();
    }
}
