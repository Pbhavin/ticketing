import request from 'supertest';
import { app } from '../../app';

it('Get the Current User Sucessfully', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@g.com',
            password: 'abcd',
        })
        .expect(201);

    const ck = response.get('Set-Cookie');
    const cuserResp = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', ck)
        .send()
        .expect(400);

    expect(cuserResp.body.currentUser.email).toEqual('test@g.com');
});
