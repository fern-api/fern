import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import { loadSdkConfigV1 } from "../loadSdkConfigV1.js";

describe("loadSdkConfigV1", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        vi.unstubAllEnvs();
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    });

    it.each([
        [
            "npm",
            "typescript",
            { url: "https://npm.buildwithfern.com", token: "${NPM_TOKEN}" },
            { registry: "npm", token: "npm-secret" }
        ],
        [
            "pypi",
            "python",
            {
                url: "https://pypi.buildwithfern.com",
                username: "${PYPI_USERNAME}",
                password: "${PYPI_PASSWORD}"
            },
            { registry: "pypi", username: "pypi-user", password: "pypi-secret" }
        ],
        [
            "maven",
            "java",
            {
                url: "https://maven.buildwithfern.com",
                username: "${MAVEN_USERNAME}",
                password: "${MAVEN_PASSWORD}",
                signature: {
                    keyId: "${MAVEN_KEY_ID}",
                    password: "${MAVEN_SIGNING_PASSWORD}",
                    secretKey: "${MAVEN_SECRET_KEY}"
                }
            },
            {
                registry: "maven",
                username: "maven-user",
                password: "maven-secret",
                signature: {
                    keyId: "maven-key",
                    password: "maven-signing-secret",
                    secretKey: "maven-secret-key"
                }
            }
        ],
        [
            "crates",
            "rust",
            { url: "https://crates.io/api/v1/crates", token: "${CARGO_REGISTRY_TOKEN}" },
            { registry: "crates", token: "crates-secret" }
        ]
    ] as const)("resolves and sanitizes %s direct publishing", async (registry, language, publish, credential) => {
        vi.stubEnv("NPM_TOKEN", "npm-secret");
        vi.stubEnv("PYPI_USERNAME", "pypi-user");
        vi.stubEnv("PYPI_PASSWORD", "pypi-secret");
        vi.stubEnv("MAVEN_USERNAME", "maven-user");
        vi.stubEnv("MAVEN_PASSWORD", "maven-secret");
        vi.stubEnv("MAVEN_KEY_ID", "maven-key");
        vi.stubEnv("MAVEN_SIGNING_PASSWORD", "maven-signing-secret");
        vi.stubEnv("MAVEN_SECRET_KEY", "maven-secret-key");
        vi.stubEnv("CARGO_REGISTRY_TOKEN", "crates-secret");
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language,
            output: { delivery: "files", publish: { registry, ...publish } }
        });

        const loaded = await loadSdkConfigV1(configPath);
        const serialized = loaded.payload.targets[0]?.body.toString("utf8") ?? "";

        expect(loaded.payload.targets[0]).toMatchObject({
            requestedOutput: { type: "publish", publish: { registry, url: publish.url } },
            publishCredential: credential
        });
        expect(JSON.parse(serialized).targets[0].output.publish).toEqual({ registry, url: publish.url });
        [
            "npm-secret",
            "pypi-secret",
            "maven-secret",
            "maven-signing-secret",
            "maven-secret-key",
            "crates-secret"
        ].forEach((secret) => expect(serialized).not.toContain(secret));
    });

    it("creates distinct sanitized single-target bodies for duplicate-language targets", async () => {
        vi.stubEnv("FIRST_NPM_TOKEN", "first-secret");
        vi.stubEnv("SECOND_NPM_TOKEN", "second-secret");
        const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-duplicate-language-"));
        temporaryDirectories.push(directory);
        const configPath = join(directory, "sdk-config.yml");
        const root = {
            schemaVersion: "sdk-config/v1",
            sdkName: "petstore",
            sdkVersion: "3.2.1",
            apiVersion: "2026-09-22",
            source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
            api: { audiences: ["public"] },
            client: { pathParameterStyle: "wrapped" },
            package: {},
            docs: {},
            generation: {},
            targets: [
                {
                    language: "typescript",
                    sdkName: "petstore-one",
                    package: { packageName: "@acme/petstore-one" },
                    output: { delivery: "files", publish: { registry: "npm", token: "${FIRST_NPM_TOKEN}" } }
                },
                {
                    language: "typescript",
                    sdkName: "petstore-two",
                    package: { packageName: "@acme/petstore-two" },
                    output: { delivery: "files", publish: { registry: "npm", token: "${SECOND_NPM_TOKEN}" } }
                }
            ]
        };
        await writeFile(configPath, YAML.stringify(root));

        const loaded = await loadSdkConfigV1(configPath);
        const bodies = loaded.payload.targets.map((target) => JSON.parse(target.body.toString("utf8")));

        expect(bodies).toHaveLength(2);
        expect(bodies[0].targets).toEqual([
            expect.objectContaining({ sdkName: "petstore-one", package: { packageName: "@acme/petstore-one" } })
        ]);
        expect(bodies[1].targets).toEqual([
            expect.objectContaining({ sdkName: "petstore-two", package: { packageName: "@acme/petstore-two" } })
        ]);
        for (const body of bodies) {
            expect(body).toMatchObject({
                schemaVersion: "sdk-config/v1",
                sdkName: "petstore",
                sdkVersion: "3.2.1",
                apiVersion: "2026-09-22",
                source: root.source,
                api: root.api,
                client: root.client
            });
            expect(JSON.stringify(body)).not.toContain("secret");
            expect(JSON.stringify(body)).not.toContain("NPM_TOKEN");
        }
        expect(loaded.payload.targets[0]?.body.equals(loaded.payload.targets[1]?.body ?? Buffer.alloc(0))).toBe(false);
        expect(loaded.payload.targets.map((target) => target.publishCredential)).toEqual([
            { registry: "npm", token: "first-secret" },
            { registry: "npm", token: "second-secret" }
        ]);
        vi.stubEnv("FIRST_NPM_TOKEN", "rotated-first-secret");
        vi.stubEnv("SECOND_NPM_TOKEN", "rotated-second-secret");
        const rotated = await loadSdkConfigV1(configPath);
        expect(rotated.payload.targets.map((target) => target.body)).toEqual(
            loaded.payload.targets.map((target) => target.body)
        );
    });

    it("bypasses direct publishing and credential resolution during preview", async () => {
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            output: {
                delivery: "zip",
                publish: { registry: "npm", url: "https://registry.npmjs.org", token: "${MISSING_TOKEN}" }
            }
        });

        const loaded = await loadSdkConfigV1(configPath, true);

        expect(loaded.payload.targets[0]).toMatchObject({ requestedOutput: { type: "download" } });
        expect(loaded.payload.targets[0]).not.toHaveProperty("publishCredential");
        expect(loaded.payload.targets[0]?.body.toString("utf8")).not.toContain("MISSING_TOKEN");
    });

    it("rejects malformed credential structure during preview without requiring completeness", async () => {
        const malformed = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            output: { delivery: "files", publish: { registry: "npm", token: { env: "NPM_TOKEN" } } }
        });
        const incomplete = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            output: { delivery: "files", publish: { registry: "npm" } }
        });

        await expect(loadSdkConfigV1(malformed.configPath, true)).rejects.toThrow("token must be a string");
        await expect(loadSdkConfigV1(incomplete.configPath, true)).resolves.toMatchObject({
            payload: { targets: [{ requestedOutput: { type: "download" } }] }
        });
    });

    it("rejects a non-object Maven signature instead of creating an empty signature", async () => {
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "java",
            output: {
                delivery: "files",
                publish: { registry: "maven", username: "user", password: "password", signature: "invalid" }
            }
        });

        await expect(loadSdkConfigV1(configPath)).rejects.toThrow(
            "Direct maven publication signature must be an object"
        );
    });

    it("reports unsupported publish options without calling them credential fields", async () => {
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            output: { delivery: "files", publish: { registry: "npm", token: "secret", tag: "next" } }
        });

        await expect(loadSdkConfigV1(configPath)).rejects.toThrow("Direct npm publication does not support option tag");
    });

    it("fails on a missing direct publishing environment variable", async () => {
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            output: { delivery: "files", publish: { registry: "npm", token: "${MISSING_TOKEN}" } }
        });

        await expect(loadSdkConfigV1(configPath)).rejects.toThrow("Environment variable MISSING_TOKEN is not defined");
    });

    it("resolves credentials for the selected last target", async () => {
        vi.stubEnv("SELECTED_TOKEN", "selected-secret");
        const configPath = await writeSdkConfigTargets(temporaryDirectories, [
            {
                language: "typescript",
                package: { packageName: "@acme/first" },
                output: { delivery: "files", publish: { registry: "npm", token: "${MISSING_TOKEN}" } }
            },
            {
                language: "typescript",
                package: { packageName: "@acme/second" },
                output: { delivery: "files", publish: { registry: "npm", token: "${SELECTED_TOKEN}" } }
            }
        ]);

        const loaded = await loadSdkConfigV1(configPath, false, { generatorIndex: 1 });

        expect(loaded.payload.targets[0]).not.toHaveProperty("publishCredential");
        expect(loaded.payload.targets[1]?.publishCredential).toEqual({
            registry: "npm",
            token: "selected-secret"
        });
        expect(
            loaded.payload.targets.map((target) => JSON.parse(target.body.toString("utf8")).targets[0].package)
        ).toEqual([{ packageName: "@acme/first" }, { packageName: "@acme/second" }]);
    });

    it.each([-1, 2])("rejects out-of-range generator index %s without exposing credentials", async (generatorIndex) => {
        const configPath = await writeSdkConfigTargets(temporaryDirectories, [
            {
                language: "typescript",
                package: { packageName: "@acme/first" },
                output: { delivery: "files", publish: { registry: "npm", token: "first-secret" } }
            },
            {
                language: "typescript",
                package: { packageName: "@acme/second" },
                output: { delivery: "files", publish: { registry: "npm", token: "second-secret" } }
            }
        ]);

        const error = await loadSdkConfigV1(configPath, false, { generatorIndex }).catch((cause: unknown) => cause);

        expect(error).toBeInstanceOf(Error);
        expect(String(error)).toContain(`Generator index ${generatorIndex} is out of range`);
        expect(String(error)).not.toContain("first-secret");
        expect(String(error)).not.toContain("second-secret");
    });

    it("rejects missing credentials on the selected target", async () => {
        const configPath = await writeSdkConfigTargets(temporaryDirectories, [
            {
                language: "typescript",
                package: { packageName: "@acme/first" },
                output: { delivery: "files", publish: { registry: "npm", token: "available" } }
            },
            {
                language: "typescript",
                package: { packageName: "@acme/second" },
                output: { delivery: "files", publish: { registry: "npm", token: "${MISSING_SELECTED_TOKEN}" } }
            }
        ]);

        await expect(loadSdkConfigV1(configPath, false, { generatorIndex: 1 })).rejects.toThrow(
            "Environment variable MISSING_SELECTED_TOKEN is not defined"
        );
    });

    it("also strips the installed schema's legacy nested credential container", async () => {
        vi.stubEnv("NPM_TOKEN", "nested-npm-secret");
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            output: {
                delivery: "files",
                publish: {
                    registry: "npm",
                    url: "https://registry.npmjs.org",
                    credentials: { token: "${NPM_TOKEN}" }
                }
            }
        });

        const loaded = await loadSdkConfigV1(configPath);

        expect(loaded.payload.targets[0]?.publishCredential).toEqual({
            registry: "npm",
            token: "nested-npm-secret"
        });
        expect(loaded.payload.targets[0]?.body.toString("utf8")).not.toContain("credentials");
        expect(loaded.payload.targets[0]?.body.toString("utf8")).not.toContain("nested-npm-secret");
    });

    it("strips credentials from unsupported direct registries before routing rejects them", async () => {
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "ruby",
            output: {
                delivery: "files",
                publish: { registry: "rubygems", credentials: { token: "unsupported-secret" } }
            }
        });

        const error = await loadSdkConfigV1(configPath).catch((cause: unknown) => cause);

        expect(error).toBeInstanceOf(Error);
        expect(String(error)).toContain("does not support direct rubygems");
        expect(String(error)).not.toContain("unsupported-secret");
    });

    it("strips unsupported top-level credential literals before validation errors", async () => {
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "ruby",
            output: {
                delivery: "files",
                publish: {
                    registry: "rubygems",
                    token: "unsupported-token",
                    username: "unsupported-user",
                    password: "unsupported-password",
                    signature: { keyId: "unsupported-key", password: "signing-password", secretKey: "secret-key" }
                }
            }
        });

        const error = await loadSdkConfigV1(configPath).catch((cause: unknown) => cause);
        const serializedError = String(error);

        expect(error).toBeInstanceOf(Error);
        expect(serializedError).toContain("does not support direct rubygems");
        expect(serializedError).not.toContain("unsupported-token");
        expect(serializedError).not.toContain("unsupported-user");
        expect(serializedError).not.toContain("unsupported-password");
        expect(serializedError).not.toContain("unsupported-key");
    });

    it.each([
        ["empty", "   ", "requires token"],
        ["OIDC", " OIDC ", "does not support OIDC"],
        ["oversized", "x".repeat(16 * 1024 + 1), "exceeds the 16 KiB field limit"]
    ])("rejects %s credentials during loading", async (_name, token, message) => {
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            output: { delivery: "files", publish: { registry: "npm", token } }
        });

        await expect(loadSdkConfigV1(configPath)).rejects.toThrow(message);
    });

    it("rejects an unsafe direct registry URL during loading", async () => {
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            output: {
                delivery: "files",
                publish: { registry: "npm", url: "https://user:password@npm.example.com", token: "secret" }
            }
        });

        await expect(loadSdkConfigV1(configPath)).rejects.toThrow(
            "Direct registry URL must use HTTPS and must not contain user information"
        );
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
        expect(JSON.parse(loaded.payload.targets[0]?.body.toString("utf8") ?? "{}")).toEqual(document);
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
                    clientPathParameterStyle: "language-default",
                    requestedOutput: { type: "download" },
                    absolutePathToLocalOutputArchive: join(directory, "generated", "typescript.zip")
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

    it("projects SDK Config GitHub delivery and package metadata for the remote request", async () => {
        const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-"));
        temporaryDirectories.push(directory);
        const configPath = join(directory, "sdk-config.yml");
        await writeFile(
            configPath,
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "petstore",
                source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
                api: {},
                client: {},
                package: { packageName: "@acme/sdk" },
                docs: {},
                generation: {},
                output: {
                    delivery: "github",
                    github: { repository: "acme/sdk", mode: "pull-request" },
                    publish: { registry: "npm" }
                },
                targets: [{ language: "typescript", generatorVersion: "4.0.0" }]
            })
        );

        await expect(loadSdkConfigV1(configPath)).resolves.toMatchObject({
            payload: {
                targets: [
                    {
                        package: { packageName: "@acme/sdk" },
                        requestedOutput: {
                            type: "github",
                            repository: "acme/sdk",
                            mode: "pull-request",
                            publish: { registry: "npm" }
                        }
                    }
                ]
            }
        });
    });

    it("preserves GitHub delivery while extracting registry publication credentials", async () => {
        vi.stubEnv("NPM_TOKEN", "github-publish-secret");
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            package: { packageName: "@acme/sdk" },
            output: {
                delivery: "github",
                github: { repository: "acme/sdk", mode: "pull-request" },
                publish: {
                    registry: "npm",
                    url: "https://npm.buildwithfern.com",
                    token: "${NPM_TOKEN}"
                }
            }
        });

        const loaded = await loadSdkConfigV1(configPath);
        const serialized = loaded.payload.targets[0]?.body.toString("utf8") ?? "";

        expect(loaded.payload.targets[0]).toMatchObject({
            requestedOutput: {
                type: "github",
                repository: "acme/sdk",
                mode: "pull-request",
                publish: { registry: "npm", url: "https://npm.buildwithfern.com" }
            },
            publishCredential: { registry: "npm", token: "github-publish-secret" }
        });
        expect(serialized).not.toContain("github-publish-secret");
        expect(serialized).not.toContain("NPM_TOKEN");
    });

    it("keeps GitHub publication preview download-only without resolving credentials", async () => {
        const { configPath } = await writeSdkConfig(temporaryDirectories, {
            language: "typescript",
            package: { packageName: "@acme/sdk" },
            output: {
                delivery: "github",
                github: { repository: "acme/sdk" },
                publish: { registry: "npm", token: "${MISSING_GITHUB_NPM_TOKEN}" }
            }
        });

        const loaded = await loadSdkConfigV1(configPath, true);

        expect(loaded.payload.targets[0]).toMatchObject({ requestedOutput: { type: "download" } });
        expect(loaded.payload.targets[0]).not.toHaveProperty("publishCredential");
        expect(loaded.payload.targets[0]?.body.toString("utf8")).not.toContain("MISSING_GITHUB_NPM_TOKEN");
    });

    it.each([
        ["release", "release"],
        ["pull-request", "pull-request"],
        ["push", "push"],
        ["commit", "push"],
        ["commit-and-release", "release"]
    ] as const)("maps the SDK Config GitHub %s mode to the remote request %s mode", async (mode, requestedMode) => {
        const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-"));
        temporaryDirectories.push(directory);
        const configPath = join(directory, "sdk-config.yml");
        await writeFile(
            configPath,
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "petstore",
                source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
                api: {},
                client: {},
                package: {},
                docs: {},
                generation: {},
                output: {
                    delivery: "github",
                    github: { repository: "acme/sdk", mode }
                },
                targets: [{ language: "typescript" }]
            })
        );

        await expect(loadSdkConfigV1(configPath)).resolves.toMatchObject({
            payload: {
                targets: [
                    {
                        requestedOutput: {
                            type: "github",
                            repository: "acme/sdk",
                            mode: requestedMode
                        }
                    }
                ]
            }
        });
    });

    it("resolves a configured ZIP filename relative to sdk-config.yml", async () => {
        const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-"));
        temporaryDirectories.push(directory);
        const configPath = join(directory, "sdk-config.yml");
        await writeFile(
            configPath,
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "petstore",
                source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
                api: {},
                client: {},
                package: {},
                docs: {},
                generation: {},
                targets: [
                    {
                        language: "typescript",
                        output: { delivery: "zip", fileName: "./artifacts/petstore.zip" }
                    }
                ]
            })
        );

        await expect(loadSdkConfigV1(configPath)).resolves.toMatchObject({
            payload: {
                targets: [
                    {
                        requestedOutput: { type: "download" },
                        absolutePathToLocalOutputArchive: join(directory, "artifacts", "petstore.zip")
                    }
                ]
            }
        });
    });

    it("uses per-language indexes for default duplicate-language ZIP filenames", async () => {
        const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-"));
        temporaryDirectories.push(directory);
        const configPath = join(directory, "sdk-config.yml");
        await writeFile(
            configPath,
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "petstore",
                source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
                api: {},
                client: {},
                package: {},
                docs: {},
                generation: {},
                targets: [
                    { language: "typescript", output: { delivery: "zip" } },
                    { language: "python", output: { delivery: "zip" } },
                    { language: "typescript", output: { delivery: "zip" } }
                ]
            })
        );

        const loaded = await loadSdkConfigV1(configPath);

        expect(loaded.payload.targets.map((target) => target.absolutePathToLocalOutputArchive)).toEqual([
            join(directory, "generated", "typescript-0.zip"),
            join(directory, "generated", "python.zip"),
            join(directory, "generated", "typescript-1.zip")
        ]);
    });
});

async function writeSdkConfig(
    temporaryDirectories: string[],
    target: Record<string, unknown>
): Promise<{ configPath: string }> {
    const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-publish-"));
    temporaryDirectories.push(directory);
    const configPath = join(directory, "sdk-config.yml");
    await writeFile(
        configPath,
        YAML.stringify({
            schemaVersion: "sdk-config/v1",
            sdkName: "petstore",
            source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
            api: {},
            client: {},
            package: {},
            docs: {},
            generation: {},
            targets: [
                {
                    ...target,
                    package:
                        target.language === "java"
                            ? { groupId: "com.acme", artifactId: "sdk" }
                            : { packageName: "acme-sdk" }
                }
            ]
        })
    );
    return { configPath };
}

async function writeSdkConfigTargets(
    temporaryDirectories: string[],
    targets: Array<Record<string, unknown>>
): Promise<string> {
    const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-selection-"));
    temporaryDirectories.push(directory);
    const configPath = join(directory, "sdk-config.yml");
    await writeFile(
        configPath,
        YAML.stringify({
            schemaVersion: "sdk-config/v1",
            sdkName: "petstore",
            source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
            api: {},
            client: {},
            package: {},
            docs: {},
            generation: {},
            targets
        })
    );
    return configPath;
}
