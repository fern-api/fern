import { AbsoluteFilePath, doesPathExist, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_DIRECTORY } from "@fern-api/project-configuration";
import { runFernCli } from "../../utils/runFernCli";
import { init } from "./init";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("fern init", () => {
    it("no existing fern directory", async () => {
        const pathOfDirectory = await init();
        await runFernCli(["check"], {
            cwd: pathOfDirectory,
        });
        expect(
            await getDirectoryContents(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY)))
        ).toMatchSnapshot();
    }, 60_000);

    it("existing fern directory", async () => {
        // add existing directory
        const pathOfDirectory = await init();

        // add new api
        await init({
            directory: pathOfDirectory,
        });
        expect(
            await doesPathExist(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY), RelativeFilePath.of("api1")))
        ).toBe(true);
    }, 60_000);

    it("init openapi", async () => {
        const openApiPath = join(
            FIXTURES_DIR,
            RelativeFilePath.of("openapi"),
            RelativeFilePath.of("petstore-openapi.yml")
        );
        const pathOfDirectory = await init({ openApiArg: openApiPath });
        expect(await getDirectoryContents(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);

    it("init openapi url", async () => {
        const pathOfDirectory = await init({ openApiArg: "https://api.texel.ai/openapi.json" });
        expect(await getDirectoryContents(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);
});
