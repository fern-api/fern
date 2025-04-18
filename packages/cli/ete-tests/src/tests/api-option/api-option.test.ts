import path from "path";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("--api", () => {
    testFixture("simple");
});

function testFixture(fixtureName: string) {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("Fails if API is not specified", async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const { stdout, failed } = await runFernCli(["ir", (await tmp.file()).path], {
                cwd: fixturePath,
                reject: false
            });
            expect(failed).toBe(true);
            expect(stdout).toContain("There are multiple workspaces. You must specify one with --api");
        }, 90_000);

        it("Succeeds if API is specified", async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const { failed } = await runFernCli(["--api", "api1", "ir", (await tmp.file()).path], {
                cwd: fixturePath
            });
            expect(failed).toBe(false);
        }, 90_000);

        it("Fail if API does not exist", async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            const { failed } = await runFernCli(["--api", "api3", "ir", (await tmp.file()).path], {
                cwd: fixturePath,
                reject: false
            });
            expect(failed).toBe(true);
        }, 90_000);
    });
}
