import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@bpticketproject/common';
import { createTicketRouter } from './routers/new';
import { currentUser } from '@bpticketproject/common';
import { showTicketRouter } from './routers/show';
import { ShowAllTicketRouter } from './routers/list';
import { UpdateTicketRouter } from './routers/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV != 'test',
    })
);
app.use(currentUser);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(ShowAllTicketRouter);
app.use(UpdateTicketRouter);
app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
