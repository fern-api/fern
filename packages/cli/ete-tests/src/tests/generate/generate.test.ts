import path from "path";
import stripAnsi from "strip-ansi";
import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("generate", () => {
    // runFernCli throws if the command exits with a non-zero exit code
    // eslint-disable-next-line jest/expect-expect
    it("simple", async () => {
        const fixturePath = path.join(FIXTURES_DIR, "simple");
        await runFernCli(["generate"], {
            cwd: fixturePath,
        });
    }, 90_000);

    it("should fail if definition is invalid", async () => {
        const fixturePath = path.join(FIXTURES_DIR, "invalid");
        const { stdout } = await runFernCli(["generate"], {
            cwd: fixturePath,
            reject: false,
        });
        expect(stripAnsi(stdout)).toContain("Type bar is not defined");
    });
});
