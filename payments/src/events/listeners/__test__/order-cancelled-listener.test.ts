import { OrderCancelledEvent, OrderStatus } from '@bpticketproject/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: orderId,
        version: 0,
        status: OrderStatus.Created,
        userId: 'abc',
        price: 10,
    });

    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 1,
        ticket: {
            id: 'abc',
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, order, data, msg };
};

it('replicate the order status to cancled', async () => {
    const { listener, order, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(data.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('ack the message ', async () => {
    const { listener, order, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
