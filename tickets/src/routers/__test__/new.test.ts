import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';

it('Making Sure Route handlier /api/tickets is listening to post request', async () => {
    const response = await request(app).post('/api/tickets').send({
        title: 'Arjit singh',
        price: '$30.00',
    });
    expect(response.status).not.toEqual(404);
});

it('Only access if User is signed in ', async () => {
    const response = await request(app).post('/api/tickets').send({
        title: 'Arjit singh',
        price: 30,
    });
    expect(response.status).toEqual(401);

    const ck = global.signup();
    const tktResponse = await request(app)
        .post('/api/tickets')
        .set('Cookie', ck)
        .send({
            title: 'Arjit singh',
            price: 30.0,
        })
        .expect(201);
});

it('Return error in case of invalid title', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: '',
            price: 30,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            price: 30,
        })
        .expect(400);
});

it('Return error in case of invalid price ', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'Arjit Singh',
            price: -10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'Arjit Singh',
        })
        .expect(400);
});

it('Create ticket sucessfully', async () => {
    const resp = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'Arjit Singh',
            price: 30,
        })
        .expect(201);

    console.log(resp.body);
    expect(resp.body.title).toEqual('Arjit Singh');
});

it('Publish an Event', async () => {
    const resp = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title: 'Arjit Singh',
            price: 30,
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
