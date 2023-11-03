import request from 'supertest';
import { app } from '../../app';

it('Return a 201 sucessful signin', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@g.com',
            password: 'abcd',
        })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@g.com',
            password: 'abcd',
        })
        .expect(201);
});

it('Return a 400 Bad Request', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test',
            password: 'abcd',
        })
        .expect(400);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@g.com',
            password: '',
        })
        .expect(400);
});

it('Credential Errors', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@g.com',
            password: 'abcd',
        })
        .expect(201);
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test123',
            password: 'abcd',
        })
        .expect(400);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@g.com',
            password: '',
        })
        .expect(400);
});
