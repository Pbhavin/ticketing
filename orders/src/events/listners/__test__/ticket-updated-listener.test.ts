import { TicketUpdatedEvent } from '@bpticketproject/common';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose, { set } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../model/ticket';
import { TicketUpdatedListner } from '../ticket-updated-listener';

const setup = async () => {
    const listener = new TicketUpdatedListner(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    });

    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        version: 1,
        id: ticket.id,
        title: 'new concert',
        price: 999,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, ticket };
};

it('find update and save a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket?.title).toEqual(data.title);
    expect(updatedTicket?.price).toEqual(data.price);
});

it('ack the message', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
