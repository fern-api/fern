import { readFile } from "fs/promises";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";
import { init } from "../init/init.js";

// Pretty trivial command, but adding tests in case this breaks down the line
describe("fern organization", () => {
    it("fern organization", async ({ signal }) => {
        const pathOfDirectory = await init({ signal });

        const out = await runFernCli(["organization"], { cwd: pathOfDirectory, signal });

        expect(out.stdout).toEqual("fern");
    }, 60_000);

    it("fern organization -o <output_file>", async ({ signal }) => {
        const pathOfDirectory = await init({ signal });

        const tmpFile = await tmp.file();
        await runFernCli(["organization", "-o", tmpFile.path], { cwd: pathOfDirectory, signal });

        const out = await readFile(tmpFile.path, "utf-8");
        expect(out).toEqual("fern");
    }, 60_000);
});
