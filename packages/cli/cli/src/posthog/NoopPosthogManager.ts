import { PosthogEvent } from "@fern-api/task-context";
import { AbstractPosthogManager } from "./AbstractPosthogManager";

export class NoopPosthogManager extends AbstractPosthogManager {
    async sendEvent(_event: PosthogEvent): Promise<void> {
        return;
    }
}
