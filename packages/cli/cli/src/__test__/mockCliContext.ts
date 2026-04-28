import { Writable } from "stream";

import { CliContext } from "../cli-context/CliContext.js";

/**
 * Create a Context for testing.
 *
 * This creates a Context instance with streams that discard output,
 * suitable for unit tests where console output is not needed.
 */
function createNullStream(): NodeJS.WriteStream {
    return new Writable({
        write(_chunk, _encoding, callback) {
            callback();
        }
    }) as NodeJS.WriteStream;
}

export async function createMockCliContext(): Promise<CliContext> {
    process.env.CLI_PACKAGE_NAME = "test-package";
    process.env.CLI_VERSION = "0.0.0";
    process.env.CLI_NAME = "test-cli";

    return CliContext.create(createNullStream(), createNullStream(), { isLocal: true });
}
