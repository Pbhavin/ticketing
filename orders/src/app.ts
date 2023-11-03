import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@bpticketproject/common';
import { createOrderRouter } from './routers/new';
import { currentUser } from '@bpticketproject/common';
import { showOrderRouter } from './routers/show';
import { listAllOrderRouter } from './routers/list';
import { deleteOrderRouter } from './routers/delete';

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
app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(listAllOrderRouter);
app.use(deleteOrderRouter);
app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
