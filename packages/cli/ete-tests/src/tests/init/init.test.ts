import { doesPathExist, getDirectoryContents, join } from "@fern-api/core-utils";
import { FERN_DIRECTORY } from "@fern-api/project-configuration";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "./init";

describe("fern init", () => {
    it("no existing fern directory", async () => {
        const pathOfDirectory = await init();
        await runFernCli(["check"], {
            cwd: pathOfDirectory,
        });
        expect(await getDirectoryContents(join(pathOfDirectory, FERN_DIRECTORY))).toMatchSnapshot();
    }, 60_000);

    it("existing fern directory", async () => {
        // add existing directory
        const pathOfDirectory = await init();

        // add new api
        await init();

        expect(await doesPathExist(join(pathOfDirectory, FERN_DIRECTORY, "api1"))).toBe(true);
    }, 60_000);
});
