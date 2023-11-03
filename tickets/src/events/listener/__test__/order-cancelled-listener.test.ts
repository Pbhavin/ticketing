import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import {
    Listener,
    OrderCancelledEvent,
    OrderStatus,
} from '@bpticketproject/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderID = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'Kumar Sanu',
        price: 10,
        userID: 'abc',
    });
    ticket.set({ orderID });

    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderID,
        version: 0,
        ticket: {
            id: ticket.id,
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, ticket, data, msg };
};

it('unset  the orderID for Ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderID).not.toBeDefined();
    expect(updatedTicket!.orderID).toEqual(undefined);
});

it('ack the message ', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publish Ticket updated event', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
