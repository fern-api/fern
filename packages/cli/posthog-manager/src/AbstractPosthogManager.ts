import { PosthogEvent } from "@fern-api/task-context";

export abstract class AbstractPosthogManager {
    abstract sendEvent(event: PosthogEvent): void;
    abstract identify(): void;
}
