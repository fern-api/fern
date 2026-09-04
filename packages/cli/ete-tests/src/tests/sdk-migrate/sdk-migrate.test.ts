import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { cp, readFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("fern sdk migrate", () => {
    it("runs from the published CLI command tree and writes only JSON to stdout", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });
        const generatorsPath = join(directory, RelativeFilePath.of("fern/generators.yml"));
        const originalGenerators = await readFile(generatorsPath, "utf-8");
        const expectedSdkConfig = JSON.parse(
            await readFile(join(directory, RelativeFilePath.of("sdk-config.json")), "utf-8")
        );

        const result = await runFernCli(["sdk", "migrate", "--api", "default", "-o", "-", "--log-level", "debug"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal,
            stripFinalNewline: false
        });

        expect(result.stdout.endsWith("\n")).toBe(true);
        const sdkConfig = JSON.parse(result.stdout);
        expect(sdkConfig).toEqual(expectedSdkConfig);
        expect(await readFile(generatorsPath, "utf-8")).toBe(originalGenerators);
        await temporaryDirectory.cleanup();
    });

    it("rejects an unknown API in a single unnamed workspace", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(["sdk", "migrate", "--api", "typo", "--output", "-"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            reject: false,
            signal
        });

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain("API 'typo' not found");
        await temporaryDirectory.cleanup();
    });

    it("protects an existing file and supports force replacement", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });
        const output = join(directory, RelativeFilePath.of("output/sdk-config.json"));
        const command = ["sdk", "migrate", "--output", output];
        const options = {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal
        };

        await runFernCli(command, options);
        const first = await readFile(output, "utf-8");
        const rejected = await runFernCli(command, { ...options, reject: false });
        expect(rejected.exitCode).not.toBe(0);
        expect(await readFile(output, "utf-8")).toBe(first);

        await runFernCli([...command, "--force"], options);
        expect(JSON.parse(await readFile(output, "utf-8"))).toMatchObject({
            schemaVersion: "sdk-config/v1",
            source: { specs: [{ path: "./fern/openapi.yml" }] }
        });
        await temporaryDirectory.cleanup();
    });

    it("maps credential-free registry publication in strict mode", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(["sdk", "migrate", "--group", "npm", "--output", "-", "--strict"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal
        });

        expect(JSON.parse(result.stdout)).toMatchObject({
            targets: [
                {
                    language: "typescript",
                    package: { packageName: "@acme/sdk" },
                    output: { delivery: "zip", publish: { registry: "npm" } }
                }
            ]
        });
        await temporaryDirectory.cleanup();
    });

    it("consolidates repeated compatible groups into one SDK Config", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(
            ["sdk", "migrate", "--group", "typescript-only", "--group", "python-only", "--output", "-"],
            {
                cwd: directory,
                env: { FERN_NO_VERSION_REDIRECTION: "true" },
                signal
            }
        );

        expect(JSON.parse(result.stdout).targets).toMatchObject([
            { language: "typescript", generatorVersion: "3.63.3" },
            { language: "python", generatorVersion: "4.3.10" }
        ]);
        await temporaryDirectory.cleanup();
    });

    it("rejects repeated groups with different audience schemas", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(
            ["sdk", "migrate", "--group", "typescript-only", "--group", "npm", "--output", "-"],
            {
                cwd: directory,
                env: { FERN_NO_VERSION_REDIRECTION: "true" },
                reject: false,
                signal
            }
        );

        expect(result.exitCode).not.toBe(0);
        expect(result.stdout).toBe("");
        expect(result.stderr).toContain("resolve to different API schemas");
        await temporaryDirectory.cleanup();
    });

    it("normalizes Maven coordinates", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });

        const result = await runFernCli(["sdk", "migrate", "--group", "maven", "--output", "-"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            signal
        });

        expect(JSON.parse(result.stdout)).toMatchObject({
            targets: [
                {
                    language: "java",
                    package: { artifactId: "sdk", groupId: "com.acme" },
                    output: {
                        delivery: "github",
                        github: { repository: "acme/sdk", mode: "pull-request" },
                        publish: { registry: "maven" }
                    }
                }
            ]
        });
        await temporaryDirectory.cleanup();
    });

    it("does not write output when strict mode encounters a diagnostic", async ({ signal }) => {
        const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        await cp(FIXTURES_DIR, directory, { recursive: true });
        const output = join(directory, RelativeFilePath.of("output/strict.json"));

        const result = await runFernCli(["sdk", "migrate", "--group", "warning", "--output", output, "--strict"], {
            cwd: directory,
            env: { FERN_NO_VERSION_REDIRECTION: "true" },
            reject: false,
            signal
        });

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain("[warning] [FERN_RESOLVED_FIELD_UNSUPPORTED]");
        await expect(readFile(output, "utf-8")).rejects.toMatchObject({ code: "ENOENT" });
        await temporaryDirectory.cleanup();
    });
}, 60_000);
