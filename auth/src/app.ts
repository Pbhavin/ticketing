import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { currentuserRouter } from './routers/current-user';
import { signinRouter } from './routers/signin';
import { signoutRouter } from './routers/signout';
import { signupRouter } from './routers/signup';
import { errorHandler, NotFoundError } from '@bpticketproject/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV != 'test',
    })
);
app.use(currentuserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
