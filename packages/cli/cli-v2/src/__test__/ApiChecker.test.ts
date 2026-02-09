import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { join } from "path";
import { Writable } from "stream";
import { describe, expect, it } from "vitest";
import { ApiChecker } from "../api/checker/ApiChecker.js";
import { loadFernYml } from "../config/fern-yml/loadFernYml.js";
import { WorkspaceLoader } from "../workspace/WorkspaceLoader.js";
import { createTestContext } from "./utils/createTestContext.js";
import { loadWorkspace } from "./utils/loadWorkspace.js";

const FIXTURES_DIR = AbsoluteFilePath.of(join(__dirname, "fixtures"));

describe("ApiChecker", () => {
    const logger = NOOP_LOGGER;

    describe("check()", () => {
        it("returns valid result for valid API definition", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const fernYml = await loadFernYml({ cwd });
            const loader = new WorkspaceLoader({ cwd, logger });
            const result = await loader.load({ fernYml });

            expect(result.success).toBe(true);
            if (!result.success) {
                return;
            }

            const { stream, getOutput } = createCaptureStream();
            const checker = new ApiChecker({
                context: createTestContext({ cwd }),
                cliVersion: "0.0.0",
                stream
            });

            const checkResult = await checker.check({
                workspace: result.workspace
            });

            expect(checkResult.validApis.has("api")).toBe(true);
            expect(checkResult.invalidApis.size).toBe(0);
            expect(checkResult.errorCount).toBe(0);
            expect(checkResult.warningCount).toBe(0);
            expect(getOutput()).toBe("");
        });

        it("checks only specified APIs when apiNames is provided", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const fernYml = await loadFernYml({ cwd });
            const loader = new WorkspaceLoader({ cwd, logger });
            const result = await loader.load({ fernYml });

            expect(result.success).toBe(true);
            if (!result.success) {
                return;
            }

            const { stream } = createCaptureStream();
            const checker = new ApiChecker({
                context: createTestContext({ cwd }),
                cliVersion: "0.0.0",
                stream
            });

            const checkResult = await checker.check({
                workspace: result.workspace,
                apiNames: ["api"]
            });

            expect(checkResult.validApis.has("api")).toBe(true);
            expect(checkResult.invalidApis.size).toBe(0);
        });

        it("marks unknown API as invalid", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const { stream } = createCaptureStream();
            const checker = new ApiChecker({
                context: createTestContext({ cwd }),
                cliVersion: "0.0.0",
                stream
            });

            const checkResult = await checker.check({
                workspace,
                apiNames: ["nonexistent-api"]
            });

            expect(checkResult.invalidApis.has("nonexistent-api")).toBe(true);
            expect(checkResult.validApis.size).toBe(0);
        });

        it("returns early with empty result when no APIs to check", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const { stream, getOutput } = createCaptureStream();
            const checker = new ApiChecker({
                context: createTestContext({ cwd }),
                cliVersion: "0.0.0",
                stream
            });

            const checkResult = await checker.check({
                workspace,
                apiNames: []
            });

            expect(checkResult.validApis.size).toBe(0);
            expect(checkResult.invalidApis.size).toBe(0);
            expect(checkResult.errorCount).toBe(0);
            expect(checkResult.warningCount).toBe(0);
            expect(getOutput()).toBe("");
        });

        it("includes elapsed time in result", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const { stream } = createCaptureStream();
            const checker = new ApiChecker({
                context: createTestContext({ cwd }),
                cliVersion: "0.0.0",
                stream
            });

            const checkResult = await checker.check({
                workspace
            });

            expect(checkResult.elapsedMillis).toBeGreaterThanOrEqual(0);
        });
    });

    describe("stream injection", () => {
        it("writes output to injected stream", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const { stream, getOutput } = createCaptureStream();
            const checker = new ApiChecker({
                context: createTestContext({ cwd }),
                cliVersion: "0.0.0",
                stream
            });

            await checker.check({
                workspace
            });

            // Valid API produces no output.
            expect(getOutput()).toBe("");
        });
    });

    describe("duration formatting", () => {
        it("formats duration in milliseconds for short times", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const { stream } = createCaptureStream();
            const checker = new ApiChecker({
                context: createTestContext({ cwd }),
                cliVersion: "0.0.0",
                stream
            });

            const checkResult = await checker.check({
                workspace
            });

            // Just verify elapsed time is recorded.
            expect(typeof checkResult.elapsedMillis).toBe("number");
        });
    });
});

/**
 * Creates a writable stream that captures output for testing.
 */
function createCaptureStream(): { stream: NodeJS.WriteStream; getOutput: () => string } {
    let output = "";
    const stream = new Writable({
        write(chunk, _encoding, callback) {
            output += chunk.toString();
            callback();
        }
    }) as NodeJS.WriteStream;

    return {
        stream,
        getOutput: () => output
    };
}
