import { noop } from "@fern-api/core-utils";

import { createLogger } from "./createLogger.js";

export const NOOP_LOGGER = createLogger(noop);
