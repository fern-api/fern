import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/configuration";
import {
    AbsoluteFilePath,
    doesPathExist,
    getDirectoryContentsForSnapshot,
    join,
    RelativeFilePath
} from "@fern-api/fs-utils";
import { copyFile, readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";
import { init } from "./init.js";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const SDK_CONFIG_ENV = { FERN_USE_SDK_GEN_API: "true" };

describe("fern init", () => {
    it.concurrent("no existing fern directory", async ({ expect, signal }) => {
        const pathOfDirectory = await init({ signal });
        expect(
            await getDirectoryContentsForSnapshot(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY)))
        ).toMatchSnapshot();
    }, 180_000);

    it.concurrent("no existing fern directory with fern definition", async ({ expect, signal }) => {
        const pathOfDirectory = await init({
            additionalArgs: [{ name: "--fern-definition" }],
            signal
        });
        await runFernCli(["check"], { cwd: pathOfDirectory, signal });
        expect(
            await getDirectoryContentsForSnapshot(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY)))
        ).toMatchSnapshot();
    }, 180_000);

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
    }, 180_000);

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
    }, 180_000);

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
    }, 180_000);

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
    }, 180_000);

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
    }, 180_000);

    it.concurrent("init docs", async ({ expect, signal }) => {
        const pathOfDirectory = await init({
            additionalArgs: [{ name: "--fern-definition" }],
            signal
        });

        await runFernCli(["init", "--docs", "--organization", "fern"], { cwd: pathOfDirectory, signal });

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory)).toMatchSnapshot();
    }, 180_000);

    it.concurrent("init docs in an empty directory builds without edits", async ({ expect, signal }) => {
        const tmpDir = await tmp.dir();
        const pathOfDirectory = AbsoluteFilePath.of(tmpDir.path);

        await runFernCli(["init", "--docs", "--organization", "fern"], { cwd: pathOfDirectory, signal });
        await runFernCli(["check"], { cwd: pathOfDirectory, signal });
        await runFernCli(["write-docs-definition", "docs-definition.json"], { cwd: pathOfDirectory, signal });

        expect(
            await doesPathExist(join(pathOfDirectory, RelativeFilePath.of("fern"), RelativeFilePath.of("docs.yml")))
        ).toBe(true);
        expect(await doesPathExist(join(pathOfDirectory, RelativeFilePath.of("docs-definition.json")))).toBe(true);
        expect(
            await getDirectoryContentsForSnapshot(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY)))
        ).toMatchSnapshot();
    }, 180_000);

    it.concurrent("init docs with --openapi builds the API reference from docs.yml alone", async ({
        expect,
        signal
    }) => {
        const tmpDir = await tmp.dir();
        const pathOfDirectory = AbsoluteFilePath.of(tmpDir.path);
        const fernDirectory = join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY));
        await copyFile(
            join(FIXTURES_DIR, RelativeFilePath.of("openapi"), RelativeFilePath.of("petstore-openapi.yml")),
            join(pathOfDirectory, RelativeFilePath.of("petstore-openapi.yml"))
        );

        // SDK Gen API mode is the setup where `fern init --openapi` writes sdk-config.yml instead of
        // generators.yml, which the docs cannot read. The spec must come from docs.yml instead.
        await runFernCli(["init", "--docs", "--organization", "fern", "--openapi", "petstore-openapi.yml"], {
            cwd: pathOfDirectory,
            env: SDK_CONFIG_ENV,
            signal
        });

        const docsYml = yaml.load(await readFile(join(fernDirectory, RelativeFilePath.of("docs.yml")), "utf8"));
        expect(docsYml).toMatchObject({
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./openapi.yml" }] }]
        });
        expect(await doesPathExist(join(fernDirectory, RelativeFilePath.of("openapi.yml")))).toBe(true);
        expect(await doesPathExist(join(fernDirectory, RelativeFilePath.of("generators.yml")))).toBe(false);
        expect(await doesPathExist(join(fernDirectory, RelativeFilePath.of("sdk-config.yml")))).toBe(false);

        await runFernCli(["check"], { cwd: pathOfDirectory, env: SDK_CONFIG_ENV, signal });
        await runFernCli(["write-docs-definition", "docs-definition.json"], {
            cwd: pathOfDirectory,
            env: SDK_CONFIG_ENV,
            signal
        });
        const docsDefinition = await readFile(
            join(pathOfDirectory, RelativeFilePath.of("docs-definition.json")),
            "utf8"
        );
        expect(docsDefinition).toMatch(/"type":\s*"endpoint"/);
    }, 180_000);

    it.concurrent("init --openapi then init --docs --openapi share one spec file in SDK Gen API mode", async ({
        expect,
        signal
    }) => {
        const tmpDir = await tmp.dir();
        const pathOfDirectory = AbsoluteFilePath.of(tmpDir.path);
        const fernDirectory = join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY));
        await copyFile(
            join(FIXTURES_DIR, RelativeFilePath.of("openapi"), RelativeFilePath.of("petstore-openapi.yml")),
            join(pathOfDirectory, RelativeFilePath.of("petstore-openapi.yml"))
        );

        await init({
            additionalArgs: [{ name: "--openapi", value: "petstore-openapi.yml" }],
            directory: pathOfDirectory,
            env: SDK_CONFIG_ENV,
            signal
        });
        await runFernCli(["init", "--docs", "--organization", "fern", "--openapi", "petstore-openapi.yml"], {
            cwd: pathOfDirectory,
            env: SDK_CONFIG_ENV,
            signal
        });

        const readYaml = async (fileName: string): Promise<unknown> =>
            yaml.load(await readFile(join(fernDirectory, RelativeFilePath.of(fileName)), "utf8"));
        expect(await readYaml("docs.yml")).toMatchObject({
            navigation: [{ api: "API Reference", specs: [{ type: "openapi", path: "./openapi.yml" }] }]
        });
        expect(await readYaml("sdk-config.yml")).toMatchObject({
            source: { specs: [{ path: "./openapi.yml" }] }
        });
    }, 180_000);

    it.concurrent("check fails when docs reference an api that does not exist", async ({ expect, signal }) => {
        const tmpDir = await tmp.dir();
        const pathOfDirectory = AbsoluteFilePath.of(tmpDir.path);

        await runFernCli(["init", "--docs", "--organization", "fern"], { cwd: pathOfDirectory, signal });
        await writeFile(
            join(pathOfDirectory, RelativeFilePath.of("fern"), RelativeFilePath.of("docs.yml")),
            [
                "instances:",
                "  - url: https://fern.docs.buildwithfern.com",
                "title: Fern | Documentation",
                "navigation:",
                "  - api: API Reference",
                ""
            ].join("\n")
        );

        const result = await runFernCli(["check"], { cwd: pathOfDirectory, reject: false, signal });
        expect(result.exitCode).not.toBe(0);
        expect(result.stdout + result.stderr).toContain("does not resolve to an API definition");
    }, 180_000);

    it.concurrent("init mintlify", async ({ expect, signal }) => {
        const mintJsonPath = join(FIXTURES_DIR, RelativeFilePath.of("mintlify"), RelativeFilePath.of("mint.json"));

        const pathOfDirectory = await init({
            additionalArgs: [{ name: "--mintlify", value: mintJsonPath }],
            signal
        });

        expect(await getDirectoryContentsForSnapshot(pathOfDirectory, { skipBinaryContents: true })).toMatchSnapshot();
    }, 180_000);

    it.concurrent("initializes an SDK Config API when SDK generation is enabled", async ({ expect, signal }) => {
        const pathOfDirectory = await init({ env: SDK_CONFIG_ENV, signal });
        const fernDirectory = join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY));

        await runFernCli(["check"], {
            cwd: pathOfDirectory,
            env: { FERN_USE_SDK_GEN_API: "false" },
            signal
        });

        expect(await doesPathExist(join(fernDirectory, RelativeFilePath.of("sdk-config.yml")))).toBe(true);
        expect(await doesPathExist(join(fernDirectory, RelativeFilePath.of("generators.yml")))).toBe(false);
        const sdkConfig = yaml.load(
            await readFile(join(fernDirectory, RelativeFilePath.of("sdk-config.yml")), "utf8")
        ) as {
            source: { specs: Array<{ path: string }> };
            targets: Array<{ generatorVersion?: string; language: string }>;
        };
        expect(sdkConfig.source.specs[0]?.path).toBe("./openapi.yml");
        expect(sdkConfig.targets).toStrictEqual([
            { language: "typescript", output: { delivery: "files", path: "../sdks/typescript" } }
        ]);
        expect(sdkConfig.targets[0]?.generatorVersion).toBeUndefined();
    }, 180_000);

    it.concurrent("materializes --openapi input in an SDK Config API workspace", async ({ expect, signal }) => {
        const tmpDir = await tmp.dir();
        const sourceOpenAPI = join(
            FIXTURES_DIR,
            RelativeFilePath.of("openapi"),
            RelativeFilePath.of("petstore-openapi.yml")
        );
        const targetOpenAPI = join(AbsoluteFilePath.of(tmpDir.path), RelativeFilePath.of("petstore-openapi.yml"));
        await copyFile(sourceOpenAPI, targetOpenAPI);

        const pathOfDirectory = await init({
            additionalArgs: [{ name: "--openapi", value: "petstore-openapi.yml" }],
            directory: AbsoluteFilePath.of(tmpDir.path),
            env: SDK_CONFIG_ENV,
            signal
        });
        const fernDirectory = join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY));

        expect(await doesPathExist(join(fernDirectory, RelativeFilePath.of("openapi.yml")))).toBe(true);
        const sdkConfig = yaml.load(
            await readFile(join(fernDirectory, RelativeFilePath.of("sdk-config.yml")), "utf8")
        ) as { source: { specs: Array<{ path: string }> } };
        expect(sdkConfig.source.specs[0]?.path).toBe("./openapi.yml");
    }, 180_000);

    it.concurrent("supports repeated initialization across SDK Config and legacy modes", async ({ expect, signal }) => {
        const pathOfDirectory = await init({ env: SDK_CONFIG_ENV, signal });

        await init({
            directory: pathOfDirectory,
            env: { FERN_USE_SDK_GEN_API: "false" },
            signal
        });
        await runFernCli(["check"], {
            cwd: pathOfDirectory,
            env: { FERN_USE_SDK_GEN_API: "false" },
            signal
        });

        const apisDirectory = join(
            pathOfDirectory,
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of(APIS_DIRECTORY)
        );
        expect(
            await doesPathExist(join(apisDirectory, RelativeFilePath.of("api"), RelativeFilePath.of("sdk-config.yml")))
        ).toBe(true);
        expect(
            await doesPathExist(join(apisDirectory, RelativeFilePath.of("api"), RelativeFilePath.of("openapi.yml")))
        ).toBe(true);
        expect(
            await doesPathExist(join(apisDirectory, RelativeFilePath.of("api1"), RelativeFilePath.of("generators.yml")))
        ).toBe(true);
    }, 180_000);

    it.concurrent("relocates an existing OpenAPI input while preserving the SDK output default", async ({
        expect,
        signal
    }) => {
        const pathOfDirectory = await init({ env: SDK_CONFIG_ENV, signal });

        await init({
            directory: pathOfDirectory,
            additionalArgs: [{ name: "--openapi", value: "fern/openapi.yml" }],
            env: SDK_CONFIG_ENV,
            signal
        });

        const apisDirectory = join(
            pathOfDirectory,
            RelativeFilePath.of(FERN_DIRECTORY),
            RelativeFilePath.of(APIS_DIRECTORY)
        );
        const originalConfig = yaml.load(
            await readFile(join(apisDirectory, RelativeFilePath.of("api/sdk-config.yml")), "utf8")
        ) as { targets: Array<{ output: { path?: string } }> };
        const newConfig = yaml.load(
            await readFile(join(apisDirectory, RelativeFilePath.of("api1/sdk-config.yml")), "utf8")
        ) as { targets: Array<{ output: { path?: string } }> };

        expect(await doesPathExist(join(apisDirectory, RelativeFilePath.of("api/openapi.yml")))).toBe(true);
        expect(await doesPathExist(join(apisDirectory, RelativeFilePath.of("api1/openapi.yml")))).toBe(true);
        expect(originalConfig.targets[0]?.output.path).toBe("../sdks/typescript");
        expect(newConfig.targets[0]?.output.path).toBe("../sdks/typescript");
    }, 180_000);

    it.concurrent("rejects Fern Definition initialization without exposing internal details", async ({
        expect,
        signal
    }) => {
        const tmpDir = await tmp.dir();
        const pathOfDirectory = AbsoluteFilePath.of(tmpDir.path);

        const result = await runFernCli(["init", "--organization", "fern", "--fern-definition"], {
            cwd: pathOfDirectory,
            env: SDK_CONFIG_ENV,
            reject: false,
            signal
        });

        const output = result.stdout + result.stderr;
        expect(result.exitCode).not.toBe(0);
        expect(output).toContain("fern init --openapi <path-or-url>");
        expect(output).not.toContain("FERN_USE_SDK_GEN_API");
        expect(output).not.toContain("SDK Gen API");
        expect(await doesPathExist(join(pathOfDirectory, RelativeFilePath.of(FERN_DIRECTORY)))).toBe(false);
    }, 180_000);
});
