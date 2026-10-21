import { readFile } from "fs/promises";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";
import { init, LEGACY_CONFIG_ENV } from "../init/init.js";

// Ensure that the generators list command works and the format doesn't change, since fern-bot consumes this
describe("fern generator get", () => {
    it("fern generator get --version", async ({ signal }) => {
        const pathOfDirectory = await init({ env: LEGACY_CONFIG_ENV, signal });

        const out = await runFernCli(
            ["generator", "get", "--generator", "fernapi/fern-typescript-sdk", "--group", "local", "--version"],
            { cwd: pathOfDirectory, signal }
        );

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);

    it("fern generator get --language", async ({ signal }) => {
        const pathOfDirectory = await init({ env: LEGACY_CONFIG_ENV, signal });

        const out = await runFernCli(
            ["generator", "get", "--generator", "fernapi/fern-typescript-sdk", "--group", "local", "--language"],
            { cwd: pathOfDirectory, signal }
        );

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);

    it("fern generator get to file", async ({ signal }) => {
        const pathOfDirectory = await init({ env: LEGACY_CONFIG_ENV, signal });
        const tmpFile = await tmp.file();
        await runFernCli(
            [
                "generator",
                "get",
                "--generator",
                "fernapi/fern-typescript-sdk",
                "--group",
                "local",
                "--language",
                "--version",
                "--repository",
                "-o",
                tmpFile.path
            ],
            { cwd: pathOfDirectory, signal }
        );

        const out = await readFile(tmpFile.path, "utf-8");
        expect(out).toMatchSnapshot();
    }, 60_000);
});
