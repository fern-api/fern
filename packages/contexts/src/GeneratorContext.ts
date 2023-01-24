import { Logger } from "@fern-api/logger";

export interface GeneratorContext {
    logger: Logger;
    fail: () => void;
}
