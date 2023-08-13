import tmp from "tmp-promise";
import { runSeedCli } from "../../utils/runSeedCli";

describe("seed", () => {
    it("python", async () => {
        const { exitCode } = await runSeedCli(
            [
                "test",
                "--docker",
                "fernapi/fern-python-sdk:0.4.0-rc0",
                "--irVersion",
                "v20",
                "--language",
                "python",
                "--log-level",
                "warn",
            ],
            {
                cwd: (await tmp.dir()).path,
            }
        );
        expect(exitCode).toEqual(0);
    }, 60_000);
});
