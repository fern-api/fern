import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { runSeedCli } from "../../utils/runSeedCli";
import { init } from "../init/init";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("seed", () => {
    it("python", async () => {
        jest.setTimeout(120000);
        const { exitCode, stdout } = await runSeedCli(["test", "--workspace", "sdk", "--log-level", "info"], {
            cwd: FIXTURES_DIR,
        });
        expect(stdout).toContain("test cases passed");
        expect(exitCode).toEqual(0);
    }, 60_000);

    it("custom fixture", async () => {
        const pathOfDirectory = await init();

        const { exitCode, stdout } = await runSeedCli(
            ["test", "--workspace", "sdk", "--log-level", "info", "--custom-fixture", pathOfDirectory],
            {
                cwd: FIXTURES_DIR,
            }
        );

        expect(stdout).toContain("Wrote files to");
        expect(exitCode).toEqual(0);
    }, 180_000);
});
