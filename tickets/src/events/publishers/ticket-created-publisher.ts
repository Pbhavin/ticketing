import {
    Subjects,
    Publisher,
    TicketCreatedEvent,
} from '@bpticketproject/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
