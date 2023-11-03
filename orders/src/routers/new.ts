import {
    BadRequestError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest,
} from '@bpticketproject/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../model/ticket';
import { Order } from '../model/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => {
                return mongoose.Types.ObjectId.isValid(input);
            })
            .withMessage('Provide valid Ticket Id'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        //find the ticket from db
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }
        // Make sure Ticket is not reserved
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already Reserved');
        }

        // calclulate expiration date
        const expiration = new Date();
        expiration.setSeconds(
            expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS
        );

        // Build the order and save to DB
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expireAt: expiration,
            ticket: ticket,
        });
        await order.save();

        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expireAt: order.expireAt.toISOString(),
            ticket: {
                id: ticket.id,
                price: ticket.price,
            },
        });

        res.status(201).send(order);
    }
);

export { router as createOrderRouter };
