import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('Return 404 if the ticket is not exists', async () => {
    const ID = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${ID}`).send().expect(404);
});

it('Return Ticket if ticket is exists', async () => {
    const title = 'Kumar sanu';
    const price = 20;

    const resp = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title,
            price,
        })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${resp.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});
