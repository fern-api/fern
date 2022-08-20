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
            const { stdout, exitCode } = await runFernCli(["ir", "--output", (await tmp.file()).path], {
                cwd: fixturePath,
                reject: false,
            });
            expect(exitCode).not.toBe(0);
            expect(stdout).toContain("There are multiple workspaces. You must specify one with --api");
        }, 90_000);

        // eslint-disable-next-line jest/expect-expect
        it("Succeeds if API is specified", async () => {
            const fixturePath = path.join(FIXTURES_DIR, fixtureName);
            await runFernCli(["--api", "my-api-1", "ir", "--output", (await tmp.file()).path], {
                cwd: fixturePath,
            });
        }, 90_000);
    });
}
