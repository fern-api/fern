import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Writable } from "stream";
import { Context } from "../../context/Context.js";

/**
 * Create a Context for testing.
 *
 * This creates a Context instance with streams that discard output,
 * suitable for unit tests where console output is not needed.
 */
export async function createTestContext({ cwd }: { cwd: AbsoluteFilePath }): Promise<Context> {
    return Context.create({
        stdout: createNullStream(),
        stderr: createNullStream(),
        cwd
    });
}

/**
 * Create a Context whose stdout/stderr are captured for assertion.
 */
export async function createTestContextWithCapture({ cwd }: { cwd: AbsoluteFilePath }): Promise<{
    context: Context;
    getStdout: () => string;
    getStderr: () => string;
}> {
    const stdout = createCapturingStream();
    const stderr = createCapturingStream();
    const context = await Context.create({ stdout: stdout.stream, stderr: stderr.stream, cwd });
    return {
        context,
        getStdout: stdout.getOutput,
        getStderr: stderr.getOutput
    };
}

/**
 * Create a writable stream that captures all written chunks so they can be
 * inspected after the test completes.
 */
function createCapturingStream(): { stream: NodeJS.WriteStream; getOutput: () => string } {
    const chunks: Buffer[] = [];
    const stream = new Writable({
        write(chunk, _encoding, callback) {
            chunks.push(Buffer.from(chunk));
            callback();
        }
    }) as NodeJS.WriteStream;
    return {
        stream,
        getOutput: () => Buffer.concat(chunks as unknown as Uint8Array[]).toString("utf-8")
    };
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
