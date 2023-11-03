import {
    Subjects,
    Publisher,
    TicketUpdatedEvent,
} from '@bpticketproject/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
