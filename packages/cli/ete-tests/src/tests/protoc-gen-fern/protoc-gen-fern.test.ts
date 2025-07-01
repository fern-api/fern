import { readFile } from "fs/promises";
import path from "path";

import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern protoc-gen-fern", () => {
    /* eslint-disable jest/no-disabled-tests */
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
