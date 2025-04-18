import { readFile } from "fs/promises";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli";
import { init } from "../init/init";

// Pretty trivial command, but adding tests in case this breaks down the line
describe("fern organization", () => {
    it("fern organization", async () => {
        const pathOfDirectory = await init();

        const out = await runFernCli(["organization"], {
            cwd: pathOfDirectory
        });

        expect(out.stdout).toEqual("fern");
    }, 60_000);

    it("fern organization -o <output_file>", async () => {
        const pathOfDirectory = await init();

        const tmpFile = await tmp.file();
        await runFernCli(["organization", "-o", tmpFile.path], {
            cwd: pathOfDirectory
        });

        const out = await readFile(tmpFile.path, "utf-8");
        expect(out).toEqual("fern");
    }, 60_000);
});
