import { noop } from "@fern-api/core-utils";

import { createLogger } from "./createLogger";

export const NOOP_LOGGER = createLogger(noop);
