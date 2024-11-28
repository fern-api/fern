import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { cp, mkdir } from "fs/promises";
import tmp from "tmp-promise";
import { runFernCli } from "../../utils/runFernCli";
import stripAnsi from "strip-ansi";
import { init } from "../init/init";
import { Options } from "execa";

const envWithCI = {
    CI: "true"
};

describe("output directory prompts", () => {
    it("doesn't show prompts for CI environment", async () => {
        const pathOfDirectory = await init();

        const { stdout } = await runFernCli(["generate", "--local", "--keepDocker"], {
            cwd: pathOfDirectory,
            env: envWithCI
        });

        const cleanOutput = stripAnsi(stdout).trim();
        expect(cleanOutput).not.toContain("contains existing files");
        expect(cleanOutput).not.toContain("Would you like to save this");
    }, 180_000);
});
