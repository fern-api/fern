import { PosthogManager } from "./PosthogManager.js";

export class NoopPosthogManager implements PosthogManager {
    public async sendEvent(): Promise<void> {
        // no-op
    }
    public async identify(): Promise<void> {
        // no-op
    }

    public async flush(): Promise<void> {
        // no-op
    }
}
