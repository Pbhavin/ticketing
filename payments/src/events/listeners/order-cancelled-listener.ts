import {
    Listener,
    OrderCancelledEvent,
    OrderStatus,
    Subjects,
} from '@bpticketproject/common';
import { queGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queGroupName = queGroupName;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1,
        });

        if (!order) {
            throw new Error('Order Not found!!');
        }
        order.set({
            status: OrderStatus.Cancelled,
        });

        await order.save();

        msg.ack();
    }
}
