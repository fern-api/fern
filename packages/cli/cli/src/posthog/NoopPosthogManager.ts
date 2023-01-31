import { PosthogEvent } from "../cli-context/CliContext";
import { AbstractPosthogManager } from "./AbstractPosthogManager";

export class NoopPosthogManager extends AbstractPosthogManager {
    async sendEvent(_event: PosthogEvent): Promise<void> {
        return;
    }
}
