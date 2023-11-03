import {
    BadRequestError,
    NotAuthorizedError,
    currentUser,
    requireAuth,
    validateRequest,
} from '@bpticketproject/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@bpticketproject/common';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
    '/api/tickets/:id',
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
        let existingTicket;

        existingTicket = await Ticket.findById(req.params.id);
        if (!existingTicket) throw new NotFoundError();

        if (existingTicket.orderID) {
            throw new BadRequestError('Can not edit Reserved Ticket!!');
        }

        if (existingTicket.userID != req.currentUser!.id)
            throw new NotAuthorizedError();

        existingTicket.set({
            title: title,
            price: price,
        });

        await existingTicket.save();

        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: existingTicket.id,
            title: existingTicket.title,
            price: existingTicket.price,
            userId: existingTicket.userID,
            version: existingTicket.version,
        });

        res.send(existingTicket);
    }
);

export { router as UpdateTicketRouter };
