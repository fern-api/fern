import tmp from "tmp-promise";
import { runSeedCli } from "../../utils/runSeedCli";

describe("seed", () => {
    it("python", async () => {
        jest.setTimeout(120000);
        const { exitCode, stdout } = await runSeedCli(
            [
                "test",
                "--docker",
                "fernapi/fern-python-sdk:0.4.0-rc0",
                "--irVersion",
                "v20",
                "--language",
                "python",
                "--compile-command",
                'echo "hello" && echo "hi"',
                "--log-level",
                "info",
            ],
            {
                cwd: (await tmp.dir()).path,
            }
        );
        expect(stdout).toContain("test cases passed");
        expect(exitCode).toEqual(0);
    }, 60_000);
});
