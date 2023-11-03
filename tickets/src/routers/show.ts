import express, { Request, Response, Router } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@bpticketproject/common';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    let existingTicket;
    try {
        existingTicket = await Ticket.findById(req.params.id);
    } catch (err) {
        throw new NotFoundError();
    }
    if (!existingTicket) {
        throw new NotFoundError();
    }
    res.status(200).send(existingTicket);
});

export { router as showTicketRouter };
