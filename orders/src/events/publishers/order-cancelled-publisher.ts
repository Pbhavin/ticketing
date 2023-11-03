import {
    OrderCancelledEvent,
    Publisher,
    Subjects,
} from '@bpticketproject/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
