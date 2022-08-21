import { noop } from "@fern-api/core-utils";
import { Logger } from "./Logger";

export const NOOP_LOGGER: Logger = {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    log: noop,
};
