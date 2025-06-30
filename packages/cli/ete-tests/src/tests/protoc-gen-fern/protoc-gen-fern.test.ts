import { readFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { createLoggingExecutable, runExeca } from "@fern-api/logging-execa";

import { PosthogEvent } from "../../../../task-context/src/TaskContext";
import { TaskResult } from "../../../../task-context/src/TaskContext";
import { TaskContext } from "../../../../task-context/src/TaskContext";
import { Logger } from "../../../../logger/src/Logger";

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

const createEmptyProtobufLogger = (): Logger => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        disable: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        enable: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        trace: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        debug: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        info: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        warn: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        error: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        log: () => {}
    };
};

function createTaskContext(): TaskContext {
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
