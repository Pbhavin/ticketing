import {
    Listener,
    NotFoundError,
    OrderCreatedEvent,
    OrderStatus,
    Subjects,
} from '@bpticketproject/common';
import { Message } from 'node-nats-streaming';
import { queGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queGroupName = queGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({ orderID: data.id });
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
