import { readFile } from "fs/promises";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

// Ensure that the generators list command works and the format doesn't change, since fern-bot consumes this
describe("fern generator get", () => {
    it("fern generator get --version", async () => {
        const pathOfDirectory = await init();

        const out = await runFernCli(
            ["generator", "get", "--generator", "fernapi/fern-typescript-node-sdk", "--group", "local", "--version"],
            {
                cwd: pathOfDirectory
            }
        );

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);

    it("fern generator get --language", async () => {
        const pathOfDirectory = await init();

        const out = await runFernCli(
            ["generator", "get", "--generator", "fernapi/fern-typescript-node-sdk", "--group", "local", "--language"],
            {
                cwd: pathOfDirectory
            }
        );

        expect(out.stdout).toMatchSnapshot();
    }, 60_000);

    it("fern generator get to file", async () => {
        const pathOfDirectory = await init();
        const tmpFile = await tmp.file();
        await runFernCli(
            [
                "generator",
                "get",
                "--generator",
                "fernapi/fern-typescript-node-sdk",
                "--group",
                "local",
                "--language",
                "--version",
                "--repository",
                "-o",
                tmpFile.path
            ],
            {
                cwd: pathOfDirectory
            }
        );

        const out = await readFile(tmpFile.path, "utf-8");
        expect(out).toMatchSnapshot();
    }, 60_000);
});
