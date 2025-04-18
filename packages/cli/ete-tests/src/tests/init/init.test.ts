import { copyFile } from "fs/promises";
import tmp from "tmp-promise";

import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/configuration";
import {
    AbsoluteFilePath,
    RelativeFilePath,
    doesPathExist,
    getDirectoryContentsForSnapshot,
    join
} from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";
import { init } from "./init";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("fern init", () => {
    it("no existing fern directory", async () => {
        const pathOfDirectory = await init();
        await runFernCli(["check"], {
            cwd: pathOfDirectory
        });
        expect(
            await getDirectoryContentsForSnapshot(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY)))
        ).toMatchSnapshot();
    }, 60_000);

    it("existing fern directory", async () => {
        // add existing directory
        const pathOfDirectory = await init();

        // add new api
        await init({
            directory: pathOfDirectory
        });
        expect(
            await doesPathExist(
                join(
                    pathOfDirectory,
                    RelativeFilePath.of(FERN_DIRECTORY),
                    RelativeFilePath.of(APIS_DIRECTORY),
                    RelativeFilePath.of("api1")
                )
            )
        ).toBe(true);
    }, 60_000);

    it("init openapi", async () => {
        // Create a temporary directory for the OpenAPI test
        const tmpDir = await tmp.dir();
        const sourceOpenAPI = join(
            FIXTURES_DIR,
            RelativeFilePath.of("openapi"),
            RelativeFilePath.of("petstore-openapi.yml")
        );
        const targetOpenAPI = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("petstore-openapi.yml"));
        await copyFile(sourceOpenAPI, targetOpenAPI);

        const pathOfDirectory = await init({
            additionalArgs: [
                { name: "--openapi", value: "petstore-openapi.yml" },
                { name: "--log-level", value: "debug" }
            ],
            directory: AbsoluteFilePath.of(tmpDir.path)
        });
        expect(await getDirectoryContentsForSnapshot(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);

    it("init docs", async () => {
        const pathOfDirectory = await init();

        await runFernCli(["init", "--docs", "--organization", "fern"], {
            cwd: pathOfDirectory
        });

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);

    it("init mintlify", async () => {
        const mintJsonPath = join(FIXTURES_DIR, RelativeFilePath.of("mintlify"), RelativeFilePath.of("mint.json"));

        const pathOfDirectory = await init({
            additionalArgs: [{ name: "--mintlify", value: mintJsonPath }]
        });

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory, { skipBinaryContents: true })).toMatchSnapshot();
    }, 60_000);
});
