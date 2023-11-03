import express, { Request, Response } from 'express';
import { validateRequest, BadRequestError } from '@bpticketproject/common';
import { body } from 'express-validator';
import { User } from '../models/User';
const router = express.Router();
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

router.post(
    '/api/users/signin',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply Password'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordMatch = await Password.compare(
            existingUser.password,
            password
        );

        if (!passwordMatch) {
            throw new BadRequestError('Invalid Password');
        }

        const usrJWT = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
            },
            process.env.JWT_KEY!
        );

        req.session = {
            jwt: usrJWT,
        };

        res.status(201).send(existingUser);
    }
);

export { router as signinRouter };
