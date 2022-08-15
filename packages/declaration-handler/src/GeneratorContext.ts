import { Logger } from "@fern-typescript/commons-v2";

export interface GeneratorContext {
    logger: Logger;
    fail: () => void;
}
