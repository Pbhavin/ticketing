import {
    ExpirationCompleteEvent,
    Listener,
    OrderStatus,
    Subjects,
} from '@bpticketproject/common';
import { queGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../model/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpireCompleteListner extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queGroupName = queGroupName;
    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new Error('Order Not Found!!');
        }

        if (order.status === OrderStatus.complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled,
        });
        await order.save();
        new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        msg.ack();
    }
}
