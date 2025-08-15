import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { readFile } from "fs/promises";
import path from "path";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern protoc-gen-fern", () => {
    it("test with buf", async () => {
        const buf = createLoggingExecutable("buf", {
            cwd: FIXTURES_DIR,
            logger: createEmptyProtobufLogger()
        });

        await buf(["generate"]);
        const contents = await readFile(path.join(FIXTURES_DIR, "output", "ir.json"), "utf-8");
        try {
            expect(contents).toMatchSnapshot();
        } catch (error) {
            console.error("IMPORTANT: Ensure buf version matches version from CI/CD (v1.50.0 as of 7/31/25).");
            throw error;
        }
    }, 60_000);
});

const createEmptyProtobufLogger = (): Logger => {
    return {
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        disable: () => {},
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        enable: () => {},
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        trace: () => {},
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        debug: () => {},
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        info: () => {},
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        warn: () => {},
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        error: () => {},
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        log: () => {}
    };
};
