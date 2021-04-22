import {
  Subjects,
  Publisher,
  ExpirationCompletedEvent,
} from "@juanckets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompletedEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
