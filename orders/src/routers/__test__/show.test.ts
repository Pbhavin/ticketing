import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../model/ticket';
import mongoose from 'mongoose';

it('fetches the order details', async () => {
    // create ticket
    const ticket = Ticket.build({
        title: 'Falguni',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();
    // build oreder with created ticket
    const user = global.signup();
    const order = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id,
        })
        .expect(201);

    // fetch order details

    const ordeFromId = await request(app)
        .get(`/api/orders/${order.body.id}`)
        .set('Cookie', user)
        .send({});

    expect(ordeFromId.body.ticket.id).toEqual(ticket.id);
});
