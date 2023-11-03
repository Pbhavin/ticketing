import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../model/order';
import { Ticket } from '../../model/ticket';
import mongoose from 'mongoose';

const createTicket = async (title: string, price: number) => {
    const ticket = Ticket.build({
        title,
        price,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();
    return ticket;
};

it('Fetch all the orders for perticular user', async () => {
    const ticket1 = await createTicket('Arjit', 45);
    const ticket2 = await createTicket('Kumar', 40);
    const ticket3 = await createTicket('Falguni', 50);

    const user1 = global.signup();
    const user2 = global.signup();

    const { body: order1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({
            ticketId: ticket1.id,
        })
        .expect(201);

    const { body: order2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({
            ticketId: ticket2.id,
        })
        .expect(201);

    await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({
            ticketId: ticket3.id,
        })
        .expect(201);

    const orders = await request(app)
        .get('/api/orders')
        .set('Cookie', user1)
        .send({});

    expect(orders.body).toHaveLength(2);
    expect(orders.body[0].id).toEqual(order1.id);
    expect(orders.body[1].id).toEqual(order2.id);
});
