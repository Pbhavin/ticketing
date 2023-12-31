import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    requireAuth,
    validateRequest,
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
} from '@bpticketproject/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
    [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }

        if (req.currentUser!.id != order.userId) {
            throw new NotAuthorizedError();
        }

        if (order.status == OrderStatus.Cancelled) {
            throw new BadRequestError('Cant pay for cancelled order!!');
        }

        const charge = await stripe.charges.create({
            amount: order.price * 100,
            currency: 'usd',
            source: token,
        });

        const payment = Payment.build({
            orderId: orderId,
            stripeId: charge.id,
        });
        await payment.save();

        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.orderId,
        });

        res.status(201).send({ id: payment.id });
    }
);

export { router as createChargeRouter };
