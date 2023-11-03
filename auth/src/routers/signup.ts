import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@bpticketproject/common';
import { User } from '../models/User';

import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
    '/api/users/signup',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters long'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new BadRequestError('User In Use');
        }

        const user = User.build({ email, password });
        await user.save();

        const usrJWT = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_KEY!
        );

        req.session = {
            jwt: usrJWT,
        };

        res.status(201).send(user);
    }
);

export { router as signupRouter };
