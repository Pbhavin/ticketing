import { app } from '../../app';
import request from 'supertest';
import mongoose from 'mongoose';
import { Ticket } from '../../model/ticket';
import { Order, OrderStatus } from '../../model/order';
import { natsWrapper } from '../../nats-wrapper';

it('Returns an Error if the ticket does not exists', async () => {
    const ticketID = new mongoose.Types.ObjectId();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ ticketId: ticketID })
        .expect(404);
});

it('Returns an Error if ticket is already reserved', async () => {
    const ticket = Ticket.build({
        title: 'Arjit S',
        price: 30,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    const order = Order.build({
        userId: 'bhavpat',
        status: OrderStatus.Created,
        expireAt: new Date(),
        ticket: ticket,
    });
    await order.save();
    const ticketID = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('Reserve the ticket', async () => {
    const ticket = Ticket.build({
        title: 'Kumar sanu',
        price: 40,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({
            ticketId: ticket.id,
        })
        .expect(201);
});

it('Making sure OrderCreated event is publish', async () => {
    const ticket = Ticket.build({
        title: 'Kumar sanu',
        price: 40,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({
            ticketId: ticket.id,
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
