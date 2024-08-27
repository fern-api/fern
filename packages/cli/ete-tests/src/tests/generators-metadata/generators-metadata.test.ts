import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

// Ensure that the generators list command works and the format doesn't change, since fern-bot consumes this
describe("fern generator metadata", () => {
    it("fern generator metadata --version", async () => {
        const pathOfDirectory = await init();

        const out = await runFernCli(
            [
                "generator",
                "metadata",
                "--generator",
                "fernapi/fern-typescript-node-sdk",
                "--group",
                "local",
                "--version"
            ],
            {
                cwd: pathOfDirectory
            }
        );

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);
});
