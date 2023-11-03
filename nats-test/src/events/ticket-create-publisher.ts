import { Publisher, Subjects } from '@bpticketproject/common';

import { TicketCreatedEvent } from '../../../common/src/events/ticket-created-event';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
