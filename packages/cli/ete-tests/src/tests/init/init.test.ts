import { AbsoluteFilePath, doesPathExist, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { APIS_DIRECTORY, FERN_DIRECTORY, OPENAPI_DIRECTORY, DEFINITION_DIRECTORY } from "@fern-api/project-configuration";
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
        const openApiPath = join(
            FIXTURES_DIR,
            RelativeFilePath.of("openapi"),
            RelativeFilePath.of("petstore-openapi.yml")
        );
        const pathOfDirectory = await init({ openApiArg: openApiPath });
        expect(await getDirectoryContents(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);

    it("init openapi url", async () => {
        const pathOfDirectory = await init({ openApiArg: "https://petstore3.swagger.io/api/v3/openapi.json" });
        expect(await getDirectoryContents(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);

    it("init docs", async () => {
        const pathOfDirectory = await init();

        await runFernCli(["init", "--docs"], {
            cwd: pathOfDirectory,
        });

        expect(await getDirectoryContents(pathOfDirectory)).toMatchSnapshot();
    }, 60_000);

    it("init openapi with existing openapi workspace", async () => {
        const openApiPath = join(
            FIXTURES_DIR,
            RelativeFilePath.of("openapi"),
            RelativeFilePath.of("petstore-openapi.yml")
        );
        const pathOfDirectory = await init({ openApiArg: openApiPath });

        const command = await runFernCli(["init", "--openapi", openApiPath], {
            cwd: pathOfDirectory,
        });

        expect(command.exitCode).toBe(0);

        expect(await doesPathExist(join(
            pathOfDirectory,
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api1"),
            RelativeFilePath.of(OPENAPI_DIRECTORY)
        )) && await doesPathExist(
            join(
                pathOfDirectory,
                RelativeFilePath.of(FERN_DIRECTORY),
                RelativeFilePath.of(APIS_DIRECTORY),
                RelativeFilePath.of("api"),
                RelativeFilePath.of(OPENAPI_DIRECTORY)
            )
        )).toBe(true);
    });
    it("init openapi with existing fern def workspace", async () => {
        const openApiPath = join(
            FIXTURES_DIR,
            RelativeFilePath.of("openapi"),
            RelativeFilePath.of("petstore-openapi.yml")
        );
        const pathOfDirectory = await init({});

        const command = await runFernCli(["init", "--openapi", openApiPath], {
            cwd: pathOfDirectory,
        });

        expect(command.exitCode).toBe(0);

        expect(await doesPathExist(join(
            pathOfDirectory,
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api1"),
            RelativeFilePath.of(OPENAPI_DIRECTORY)
        )) && await doesPathExist(
            join(
                pathOfDirectory,
                RelativeFilePath.of(FERN_DIRECTORY),
                RelativeFilePath.of(APIS_DIRECTORY),
                RelativeFilePath.of("api"),
                RelativeFilePath.of(DEFINITION_DIRECTORY)
            )
        )).toBe(true);
    });

    it("init docs url", async () => {
        const pathOfDirectory = await init();

        await runFernCli(
            [
                "init",
                "--docs",
                "--organization",
                "oneschema",
                "--url",
                "https://docs.oneschema.co/",
                "--log-level",
                "debug",
            ],
            {
                cwd: pathOfDirectory,
            }
        );

        const command = await runFernCli(["check"], {
            cwd: pathOfDirectory,
        });

        expect(command.exitCode).toBe(0);
    }, 60_000);
});
