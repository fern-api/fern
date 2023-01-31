import { PosthogEvent } from "../cli-context/CliContext";

export abstract class AbstractPosthogManager {
    abstract sendEvent(event: PosthogEvent): void;
}
