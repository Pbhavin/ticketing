import {
    ExpirationCompleteEvent,
    Publisher,
    Subjects,
} from '@bpticketproject/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
