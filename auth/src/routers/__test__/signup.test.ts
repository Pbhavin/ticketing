import request from 'supertest';
import { app } from '../../app';

it('returns a 201 sucessful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@g.com',
            password: 'abcd',
        })
        .expect(201);
});
it('Returns a 400 email invalid', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test',
            password: 'abcd',
        })
        .expect(400);
});
it('Disallow duplicate  email ', async () => {
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
            email: 'test@g.com',
            password: 'abcd',
        })
        .expect(400);
});
it('Check cokkie is set ', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@g.com',
            password: 'abcd',
        })
        .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined();
});
