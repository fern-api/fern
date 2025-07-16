import { PosthogManager } from "./PosthogManager";

export class NoopPosthogManager implements PosthogManager {
    async sendEvent(): Promise<void> {
        // no-op
    }
    async identify(): Promise<void> {
        // no-op
    }

    async flush(): Promise<void> {
        // no-op
    }
}
