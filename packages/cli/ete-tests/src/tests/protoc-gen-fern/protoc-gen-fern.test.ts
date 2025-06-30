import { readFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { createLoggingExecutable, runExeca } from "@fern-api/logging-execa";


import { createEmptyProtobufLogger } from "../../../../workspace/lazy-fern-workspace/src/protobuf/utils";
import { AbsoluteFilePath, getDirectoryContentsForSnapshot, RelativeFilePath } from "@fern-api/fs-utils";
import { PosthogEvent } from "../../../../task-context/src/TaskContext";
import { TaskResult } from "../../../../task-context/src/TaskContext";
import { TaskContext } from "../../../../task-context/src/TaskContext";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern protoc-gen-fern", () => {
    it("test with buf", async () => {

        const buf = createLoggingExecutable("buf", {
            cwd: FIXTURES_DIR,
            logger: createEmptyProtobufLogger()
        });

        await buf(["generate"]);

        const contents = await readFile(path.join(FIXTURES_DIR, "output", "ir.json"), "utf-8");
        expect(contents).toMatchSnapshot();
    }, 60_000);
});

export function createTaskContext(): TaskContext {
    const context: TaskContext = {
        logger: createEmptyProtobufLogger(),
        takeOverTerminal: async (run: () => void | Promise<void>) => {
            // no-op
        },
        failAndThrow: (_message?: string, _error?: unknown) => {
            throw new Error("unimplemented");
        },
        failWithoutThrowing: (_message?: string, _error?: unknown) => {
            // no-op
        },
        getResult: () => TaskResult.Success,
        addInteractiveTask: () => {
            throw new Error("unimplemented");
        },
        runInteractiveTask: async (_params, _run) => {
            // no-op
            return false;
        },
        instrumentPostHogEvent: async (_event: PosthogEvent) => {
            // no-op
        }
    };
    return context;
}
