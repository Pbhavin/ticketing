import { app } from '../../app';
import request from 'supertest';
import { Ticket } from '../../model/ticket';
import { OrderStatus } from '@bpticketproject/common';
import { Order } from '../../model/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('Delete the existing Order ', async () => {
    // create ticket
    const ticket = Ticket.build({
        title: 'Falguni',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();
    // build oreder with created ticket
    const user = global.signup();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id,
        })
        .expect(201);

    // delete the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    const deletedOrder = await Order.findById(order.id);
    expect(deletedOrder!.id).toEqual(order.id);
    expect(deletedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Make sure Order Cancelled event is publish', async () => {
    // create ticket
    const ticket = Ticket.build({
        title: 'Falguni',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();
    // build oreder with created ticket
    const user = global.signup();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id,
        })
        .expect(201);

    // delete the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
