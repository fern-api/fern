import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";

const DEFAULT_VERSION = "0.0.0";

describe("version", () => {
    it("--version", async ({ signal }) => {
        const { stdout } = await runFernCli(["--version"], { cwd: (await tmp.dir()).path, signal });
        expect(stdout).toEqual(DEFAULT_VERSION);
    }, 60_000);

    it("-v", async ({ signal }) => {
        const { stdout } = await runFernCli(["-v"], { cwd: (await tmp.dir()).path, signal });
        expect(stdout).toEqual(DEFAULT_VERSION);
    }, 60_000);
});
