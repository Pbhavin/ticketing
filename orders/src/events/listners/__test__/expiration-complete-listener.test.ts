import mongoose from 'mongoose';
import { Ticket } from '../../../model/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpireCompleteListner } from '../expiration-complete-listener';
import { Order, OrderStatus } from '../../../model/order';
import { ExpirationCompleteEvent } from '@bpticketproject/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new ExpireCompleteListner(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Bhavin',
        price: 10,
    });

    await ticket.save();

    const order = Order.build({
        userId: ' abcd',
        status: OrderStatus.Created,
        expireAt: new Date(),
        ticket,
    });

    order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, order, data, msg };
};

it(' update the order status to cancled', async () => {
    const { listener, order, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(data.orderId);
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('Order cancle event is emmited ', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish as jest.Mock).toHaveBeenCalled();
    const eventData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(eventData.id).toEqual(order.id);
});

it('ack is called', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});
