import { useState, useEffect } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

import StripeCheckout from 'react-stripe-checkout';

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id,
        },
        onSuccess: (payment) => {
            Router.push('/orders/');
        },
    });
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expireAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    if (timeLeft < 0) {
        return <div>Time Expired!!</div>;
    }

    const onToken = ({ id }) => {
        doRequest({ token: id });
    };

    return (
        <div>
            <h1>Purchasing {order.ticket.title} </h1>
            <h4>Price : {order.ticket.price} </h4>
            <h4>you have {timeLeft} seconds left to Pay </h4>
            <StripeCheckout
                token={onToken}
                stripeKey="pk_test_51O4VXgGvPx0PCXdITLBd1hml3AMHpWBlEoscPSD3I2YqosOCpRzXmPCnGkklMc5mZ45yHH9JKGeS1jPIJJVF36dU00KCm1GVMY"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;

    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
};

export default OrderShow;
