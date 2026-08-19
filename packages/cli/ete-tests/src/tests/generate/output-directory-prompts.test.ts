import stripAnsi from "strip-ansi";

import { runFernCli } from "../../utils/runFernCli.js";
import { init } from "../init/init.js";

const envWithCI = {
    CI: "true"
};

describe("output directory prompts", () => {
    it("doesn't show prompts for CI environment", async ({ signal }) => {
        const pathOfDirectory = await init({ signal });

        const { stdout } = await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory,
            env: envWithCI,
            signal
        });

        const cleanOutput = stripAnsi(stdout).trim();
        expect(cleanOutput).not.toContain("contains existing files");
        expect(cleanOutput).not.toContain("Would you like to save this");
    }, 300_000);
});
