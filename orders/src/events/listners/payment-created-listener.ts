import {
    Listener,
    OrderStatus,
    PaymentCreatedEvent,
    Subjects,
} from '@bpticketproject/common';
import { queGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../model/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queGroupName = queGroupName;
    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('Order Not Found!');
        }

        order.set({ status: OrderStatus.complete });
        await order.save();

        msg.ack();
    }
}
