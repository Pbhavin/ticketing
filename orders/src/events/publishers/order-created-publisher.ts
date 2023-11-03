import {
    OrderCreatedEvent,
    Publisher,
    Subjects,
} from '@bpticketproject/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
