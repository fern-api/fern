import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/configuration";
import {
    AbsoluteFilePath,
    doesPathExist,
    getDirectoryContentsForSnapshot,
    join,
    RelativeFilePath
} from "@fern-api/fs-utils";
import { copyFile } from "fs/promises";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";
import { init } from "./init.js";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("fern init", () => {
    it.concurrent("no existing fern directory", async ({ expect, signal }) => {
        const pathOfDirectory = await init({ signal });
        expect(
            await getDirectoryContentsForSnapshot(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY)))
        ).toMatchSnapshot();
    }, 60_000);

    it.concurrent("no existing fern directory with fern definition", async ({ expect, signal }) => {
        const pathOfDirectory = await init({
            additionalArgs: [{ name: "--fern-definition" }],
            signal
        });
        await runFernCli(["check"], { cwd: pathOfDirectory, signal });
        expect(
            await getDirectoryContentsForSnapshot(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY)))
        ).toMatchSnapshot();
    }, 60_000);

    it.concurrent("existing fern directory", async ({ expect, signal }) => {
        // add existing directory
        const pathOfDirectory = await init({
            additionalArgs: [{ name: "--fern-definition" }],
            signal
        });

        // add new api
        await init({
            directory: pathOfDirectory,
            additionalArgs: [{ name: "--fern-definition" }],
            signal
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

    it.concurrent("init openapi", async ({ expect, signal }) => {
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
            directory: AbsoluteFilePath.of(tmpDir.path),
            signal
        });
        expect(await getDirectoryContentsForSnapshot(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);

    it.concurrent("existing openapi fern directory", async ({ expect, signal }) => {
        const pathOfDirectory = await init({ signal });

        await init({
            directory: pathOfDirectory,
            signal
        });
        expect(
            await doesPathExist(
                join(
                    pathOfDirectory,
                    RelativeFilePath.of(FERN_DIRECTORY),
                    RelativeFilePath.of(APIS_DIRECTORY),
                    RelativeFilePath.of("api")
                )
            )
        ).toBe(true);
        expect(
            await doesPathExist(
                join(
                    pathOfDirectory,
                    RelativeFilePath.of(FERN_DIRECTORY),
                    RelativeFilePath.of(APIS_DIRECTORY),
                    RelativeFilePath.of("api"),
                    RelativeFilePath.of("generators.yml")
                )
            )
        ).toBe(true);
        expect(
            await doesPathExist(
                join(
                    pathOfDirectory,
                    RelativeFilePath.of(FERN_DIRECTORY),
                    RelativeFilePath.of(APIS_DIRECTORY),
                    RelativeFilePath.of("api"),
                    RelativeFilePath.of("openapi.yml")
                )
            )
        ).toBe(true);
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

    it.concurrent("existing openapi then fern-definition", async ({ expect, signal }) => {
        const pathOfDirectory = await init({ signal });

        await init({
            directory: pathOfDirectory,
            additionalArgs: [{ name: "--fern-definition" }],
            signal
        });
        expect(
            await doesPathExist(
                join(
                    pathOfDirectory,
                    RelativeFilePath.of(FERN_DIRECTORY),
                    RelativeFilePath.of(APIS_DIRECTORY),
                    RelativeFilePath.of("api"),
                    RelativeFilePath.of("openapi.yml")
                )
            )
        ).toBe(true);
        expect(
            await doesPathExist(
                join(
                    pathOfDirectory,
                    RelativeFilePath.of(FERN_DIRECTORY),
                    RelativeFilePath.of(APIS_DIRECTORY),
                    RelativeFilePath.of("api1"),
                    RelativeFilePath.of("definition")
                )
            )
        ).toBe(true);
    }, 60_000);

    it.concurrent("conflicting --openapi and --fern-definition flags", async ({ expect, signal }) => {
        const tmpDir = await tmp.dir();
        const sourceOpenAPI = join(
            FIXTURES_DIR,
            RelativeFilePath.of("openapi"),
            RelativeFilePath.of("petstore-openapi.yml")
        );
        const targetOpenAPI = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("petstore-openapi.yml"));
        await copyFile(sourceOpenAPI, targetOpenAPI);

        const result = await runFernCli(
            ["init", "--organization", "fern", "--openapi", "petstore-openapi.yml", "--fern-definition"],
            {
                cwd: AbsoluteFilePath.of(tmpDir.path),
                reject: false,
                signal
            }
        );
        expect(result.exitCode).not.toBe(0);
    }, 60_000);

    it.concurrent("init docs", async ({ expect, signal }) => {
        const pathOfDirectory = await init({
            additionalArgs: [{ name: "--fern-definition" }],
            signal
        });

        await runFernCli(["init", "--docs", "--organization", "fern"], { cwd: pathOfDirectory, signal });

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);

    it.concurrent("init mintlify", async ({ expect, signal }) => {
        const mintJsonPath = join(FIXTURES_DIR, RelativeFilePath.of("mintlify"), RelativeFilePath.of("mint.json"));

        const pathOfDirectory = await init({
            additionalArgs: [{ name: "--mintlify", value: mintJsonPath }],
            signal
        });

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory, { skipBinaryContents: true })).toMatchSnapshot();
    }, 60_000);
});
