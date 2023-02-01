import { AbstractPosthogManager } from "./AbstractPosthogManager";

export class NoopPosthogManager extends AbstractPosthogManager {
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
