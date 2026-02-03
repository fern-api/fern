import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Writable } from "stream";
import { Context } from "../../context/Context";

/**
 * Create a Context for testing.
 *
 * This creates a Context instance with streams that discard output,
 * suitable for unit tests where console output is not needed.
 */
export function createTestContext({ cwd }: { cwd: AbsoluteFilePath }): Context {
    return new Context({
        stdout: createNullStream(),
        stderr: createNullStream(),
        cwd
    });
}

/**
 * A writable stream that discards all output.
 * Used for testing to suppress console output.
 */
function createNullStream(): NodeJS.WriteStream {
    return new Writable({
        write(_chunk, _encoding, callback) {
            callback();
        }
    }) as NodeJS.WriteStream;
}
