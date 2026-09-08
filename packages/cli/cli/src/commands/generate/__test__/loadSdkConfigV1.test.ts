import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import YAML from "yaml";

import { loadSdkConfigV1 } from "../loadSdkConfigV1.js";

describe("loadSdkConfigV1", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    it("loads YAML, materializes runtime defaults, and prepares JSON transport", async () => {
        const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-"));
        temporaryDirectories.push(directory);
        const configPath = join(directory, "sdk-config.yml");
        const document = {
            schemaVersion: "sdk-config/v1",
            sdkName: "petstore",
            source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
            api: { audiences: [] },
            client: { pathParameterStyle: "wrapped" },
            package: {},
            docs: {},
            generation: {},
            targets: [
                {
                    language: "typescript",
                    generatorVersion: "4.0.0",
                    sdkName: "petstore-node",
                    sdkVersion: "2.0.0",
                    client: { pathParameterStyle: "language-default" },
                    output: { delivery: "zip" }
                }
            ]
        };
        const body = YAML.stringify(document);
        await writeFile(configPath, body);

        const loaded = await loadSdkConfigV1(configPath);

        expect(loaded.absolutePath).toBe(configPath);
        expect(JSON.parse(loaded.payload.body.toString("utf8"))).toEqual(document);
        expect(loaded.payload).toMatchObject({
            sdkName: "petstore",
            sdkVersion: "1.0.0",
            audiences: [],
            clientPathParameterStyle: "wrapped",
            targets: [
                {
                    language: "typescript",
                    generatorVersion: "4.0.0",
                    sdkName: "petstore-node",
                    sdkVersion: "2.0.0",
                    clientPathParameterStyle: "language-default"
                }
            ]
        });
    });

    it("rejects invalid SDK Config input with the resolved path", async () => {
        const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-"));
        temporaryDirectories.push(directory);
        const configPath = join(directory, "sdk-config.yml");
        await writeFile(configPath, '{"schemaVersion":"sdk-config/v1"}\n');

        await expect(loadSdkConfigV1(configPath)).rejects.toThrow(`SDK Config v1 at ${configPath} failed validation`);
    });

    it("continues to accept JSON SDK Config documents", async () => {
        const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-"));
        temporaryDirectories.push(directory);
        const configPath = join(directory, "sdk-config.json");
        await writeFile(
            configPath,
            JSON.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "petstore",
                source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
                api: {},
                client: {},
                package: {},
                docs: {},
                generation: {},
                targets: [{ language: "typescript", output: { delivery: "zip" } }]
            })
        );

        await expect(loadSdkConfigV1(configPath)).resolves.toMatchObject({
            payload: { sdkName: "petstore", targets: [{ language: "typescript" }] }
        });
    });
});
