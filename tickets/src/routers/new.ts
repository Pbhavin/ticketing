import express, { Request, Response } from 'express';
import {
    BadRequestError,
    requireAuth,
    validateRequest,
} from '@bpticketproject/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/tickets',
    requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .isString()
            .withMessage('Provide the valid title'),
        body('price').isFloat({ gt: 0 }).withMessage('Provide valid price'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { title, price } = req.body;

        const existingTicket = await Ticket.findOne({ title });
        if (existingTicket) {
            throw new BadRequestError('Ticket is already Exists');
        }

        const ticket = Ticket.build({
            title: title,
            price: price,
            userID: req.currentUser!.id,
        });
        await ticket.save();
        new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userID,
            version: ticket.version,
        });

        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter };
