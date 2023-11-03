import request from 'supertest';
import { app } from '../../app';

const createTicket = async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'Arjit singh',
            price: 30.0,
        });
};

it('Return list of Tickets', async () => {
    createTicket();
    createTicket();
    createTicket();

    const resp = await request(app).get('/api/tickets').send().expect(200);
    expect(resp.body.length).toEqual(3);
});
