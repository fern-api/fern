import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

// Ensure that the generators list command works and the format doesn't change, since fern-bot consumes this
describe("fern generator list", () => {
    it("fern generator list", async () => {
        const pathOfDirectory = await init();

        const out = await runFernCli(["generator", "list"], {
            cwd: pathOfDirectory
        });

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);

    it("fern generator list with exclude", async () => {
        const pathOfDirectory = await init();

        const out = await runFernCli(["generator", "list", "--excluded-modes", "local-file-system"], {
            cwd: pathOfDirectory
        });

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);

    it("fern generator list with include", async () => {
        const pathOfDirectory = await init();

        const out = await runFernCli(["generator", "list", "--included-modes", "local-file-system"], {
            cwd: pathOfDirectory
        });

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);
});
