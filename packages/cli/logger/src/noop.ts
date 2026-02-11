import { noop } from "@fern-api/core-utils";

import { createLogger } from "./createLogger";

export const NOOP_LOGGER: import("/home/ubuntu/repos/fern/packages/cli/logger/src/Logger").Logger = createLogger(noop);
