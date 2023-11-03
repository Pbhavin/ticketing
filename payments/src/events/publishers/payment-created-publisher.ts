import {
    PaymentCreatedEvent,
    Publisher,
    Subjects,
} from '@bpticketproject/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
