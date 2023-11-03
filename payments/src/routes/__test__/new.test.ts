import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@bpticketproject/common';
import { stripe } from '../../stripe';

jest.mock('../../stripe');

it('return 404 when purchasing invalid order', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'abcd',
            orderId: new mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it('return 401 when purchasing doesnt belong to the user', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: orderId,
        price: 10,
        version: 0,
        userId: 'abcd',
        status: OrderStatus.Created,
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'abc',
            orderId: orderId,
        })
        .expect(401);
});

it('returns a 400 when purchasing cancelled order', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: orderId,
        price: 10,
        version: 0,
        userId: 'abcd',
        status: OrderStatus.Cancelled,
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup(order.userId))
        .send({
            token: 'abc',
            orderId: orderId,
        })
        .expect(400);
});

it('return 204 with valid inputs ', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: orderId,
        price: 10,
        version: 0,
        userId: 'abcd',
        status: OrderStatus.Created,
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup(order.userId))
        .send({
            token: 'tok_visa',
            orderId: orderId,
        })
        .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.currency).toEqual('usd');
    expect(chargeOptions.amount).toEqual(order.price * 100);
    expect(stripe.charges.create).toHaveBeenCalled();
});
