import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli";

const DEFAULT_VERSION = "0.0.0";

describe("version", () => {
    it("--version", async () => {
        const { stdout } = await runFernCli(["--version"], {
            cwd: (await tmp.dir()).path
        });
        expect(stdout).toEqual(DEFAULT_VERSION);
    }, 60_000);

    it("-v", async () => {
        const { stdout } = await runFernCli(["-v"], {
            cwd: (await tmp.dir()).path
        });
        expect(stdout).toEqual(DEFAULT_VERSION);
    }, 60_000);
});
