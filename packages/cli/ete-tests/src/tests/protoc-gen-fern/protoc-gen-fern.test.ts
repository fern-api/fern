import { readFile } from "fs/promises";
import path from "path";

import { createLoggingExecutable } from "@fern-api/logging-execa";

import { Logger } from "../../../../logger/src/Logger";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern protoc-gen-fern", () => {
    it("test with buf", async () => {
        const buf = createLoggingExecutable("buf", {
            cwd: FIXTURES_DIR,
            logger: createEmptyProtobufLogger()
        });

        await buf(["generate"]);
        let contents = await readFile(path.join(FIXTURES_DIR, "output", "ir.json"), "utf-8");
        const parsed = JSON.parse(contents);
        const filterDocs = (obj: any): any => {
            if (Array.isArray(obj)) {
                return obj.map(filterDocs);
            }
            if (obj && typeof obj === 'object') {
                const filtered: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (key !== 'docs') {
                        filtered[key] = filterDocs(value);
                    }
                }
                return filtered;
            }
            return obj;
        };
        const filtered = filterDocs(parsed);
        contents = JSON.stringify(filtered, null, 2);
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
