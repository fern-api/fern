import { runFernCli } from "../../utils/runFernCli.js";
import { init, LEGACY_CONFIG_ENV } from "../init/init.js";

// Ensure that the generators list command works and its output format only changes intentionally.
// Each API nests legacy generator groups under `groups` and SDK Config targets under `targets`.
describe("fern generator list", () => {
    it("fern generator list", async ({ signal }) => {
        const pathOfDirectory = await init({ env: LEGACY_CONFIG_ENV, signal });

        const out = await runFernCli(["generator", "list"], { cwd: pathOfDirectory, signal });

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);

    it("fern generator list with exclude", async ({ signal }) => {
        const pathOfDirectory = await init({ env: LEGACY_CONFIG_ENV, signal });

        const out = await runFernCli(["generator", "list", "--exclude-mode", "local-file-system"], {
            cwd: pathOfDirectory,
            signal
        });

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);

    it("fern generator list with include", async ({ signal }) => {
        const pathOfDirectory = await init({ env: LEGACY_CONFIG_ENV, signal });

        const out = await runFernCli(["generator", "list", "--include-mode", "local-file-system"], {
            cwd: pathOfDirectory,
            signal
        });

        expect(out.stdout).toMatchSnapshot();
    }, 180_000);
});
