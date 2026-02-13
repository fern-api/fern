import { PosthogEvent } from "./PosthogEvent.js";

export interface PosthogManager {
    sendEvent(event: PosthogEvent): void;
    identify(): void;
    flush(): Promise<void>;
}
