import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('Returns 404 if the id is invalid', async () => {
    const ID = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${ID}`)
        .set('Cookie', global.signup())
        .send({
            title: 'Arjit Singh',
            price: 30,
        })
        .expect(404);
});

it('Returns 401 if user is not signed in', async () => {
    const ID = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${ID}`)
        .send({
            title: 'Arjit Singh',
            price: 30,
        })
        .expect(401);
});

it('Returns 401 if user is not owner of ticket', async () => {
    //const ck = global.signup();
    const resp = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'Arjit Singh',
            price: 30,
        });

    await request(app)
        .put(`/api/tickets/${resp.body.id}`)
        .set('Cookie', global.signup())
        .send({
            title: 'Arjit Singh',
            price: 300,
        })
        .expect(401);
});

it('Returns 400 if price and title are invalid', async () => {
    const ck = global.signup();
    const resp = await request(app)
        .post('/api/tickets')
        .set('Cookie', ck)
        .send({
            title: 'Arjit Singh',
            price: 30,
        });
    await request(app)
        .put(`/api/tickets/${resp.body.id}`)
        .set('Cookie', ck)
        .send({
            title: 'Arjit Singh',
            price: -300,
        })
        .expect(400);
    await request(app)
        .put(`/api/tickets/${resp.body.id}`)
        .set('Cookie', ck)
        .send({
            title: '',
            price: -300,
        })
        .expect(400);
});

it('update tickets provided valid inputs', async () => {
    const ck = global.signup();
    const resp = await request(app)
        .post('/api/tickets')
        .set('Cookie', ck)
        .send({
            title: 'Arjit Singh',
            price: 30,
        });
    const updateResp = await request(app)
        .put(`/api/tickets/${resp.body.id}`)
        .set('Cookie', ck)
        .send({
            title: 'Kumar Sanu',
            price: 50,
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${updateResp.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual('Kumar Sanu');
    expect(ticketResponse.body.price).toEqual(50);
});

it('Publish an Event', async () => {
    const ck = global.signup();
    const resp = await request(app)
        .post('/api/tickets')
        .set('Cookie', ck)
        .send({
            title: 'Arjit Singh',
            price: 30,
        });
    const updateResp = await request(app)
        .put(`/api/tickets/${resp.body.id}`)
        .set('Cookie', ck)
        .send({
            title: 'Kumar Sanu',
            price: 50,
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Reject update ticket if reserved', async () => {
    const ck = global.signup();
    const resp = await request(app)
        .post('/api/tickets')
        .set('Cookie', ck)
        .send({
            title: 'Arjit Singh',
            price: 30,
        });

    const ticket = await Ticket.findById(resp.body.id);
    ticket!.set({ orderID: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    const updateResp = await request(app)
        .put(`/api/tickets/${resp.body.id}`)
        .set('Cookie', ck)
        .send({
            title: 'Kumar Sanu',
            price: 50,
        })
        .expect(400);
});
