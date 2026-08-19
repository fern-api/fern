import type { PosthogAutomationEvent, PosthogEvent } from "@fern-api/task-context";

export interface PosthogManager {
    sendEvent(event: PosthogEvent): void;
    sendAutomationEvent(event: PosthogAutomationEvent): void;
    identify(): void;
    flush(): Promise<void>;
}
