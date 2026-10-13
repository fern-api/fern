import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { generatorsYml } from "@fern-api/configuration-loader";
import { createFernSdkGenApiRequest } from "@fern-api/remote-workspace-runner";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import { type LoadedSdkConfigV1, loadSdkConfigV1 } from "../loadSdkConfigV1.js";

const DISTRIBUTION = {
    githubApp: { appIdSecretName: "CANARY_APP_ID", privateKeySecretName: "CANARY_APP_PRIVATE_KEY" },
    homebrew: { tap: "acme/homebrew-tap", formula: "acme", tokenSecretName: "CANARY_HOMEBREW_TOKEN" },
    scoop: { bucket: "acme/scoop-bucket", tokenSecretName: "CANARY_SCOOP_TOKEN" }
};
const DISTRIBUTION_SECRET_NAMES = [
    "CANARY_APP_ID",
    "CANARY_APP_PRIVATE_KEY",
    "CANARY_HOMEBREW_TOKEN",
    "CANARY_SCOOP_TOKEN"
];
const GITHUB_CREDENTIALS = {
    token: "${CANARY_GH_TOKEN}",
    username: "${CANARY_GH_USERNAME}",
    password: "literal-gh-password-canary",
    apiKey: "${CANARY_GH_API_KEY}"
};
const CANARY_ENV: Record<string, string> = {
    CANARY_GH_TOKEN: "ghp_canary0000000000000000000000000000",
    CANARY_GH_USERNAME: "gh-user-canary",
    CANARY_GH_API_KEY: "gh-api-key-canary",
    CANARY_NPM_TOKEN: "npm_canary0000000000000000000000000000",
    CANARY_APP_ID: "app-id-value-canary",
    CANARY_APP_PRIVATE_KEY: "-----BEGIN RSA PRIVATE KEY-----canary",
    CANARY_HOMEBREW_TOKEN: "ghp_homebrew_canary",
    CANARY_SCOOP_TOKEN: "ghp_scoop_canary"
};
const FORBIDDEN_IN_TRANSPORT = [
    ...Object.values(CANARY_ENV),
    GITHUB_CREDENTIALS.password,
    "CANARY_GH_",
    "CANARY_NPM_TOKEN"
];

describe("loadSdkConfigV1 credential guard", () => {
    const temporaryDirectories: string[] = [];
    const originalEnv = process.env;

    afterEach(async () => {
        process.env = originalEnv;
        vi.unstubAllEnvs();
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    });

    it("never resolves or sends CLI distribution secret names as credentials", async () => {
        stubCanaryEnv();
        const envReads = recordEnvReads();
        const configPath = await writeSdkConfig(temporaryDirectories, {
            targets: [
                {
                    language: "cli",
                    package: { packageName: "acme" },
                    output: {
                        delivery: "github",
                        github: { repository: "acme/acme-cli", mode: "release" },
                        distribution: DISTRIBUTION
                    }
                }
            ]
        });

        const loaded = await loadSdkConfigV1(configPath);
        const target = loaded.payload.targets[0];
        const body = JSON.parse(target?.body.toString("utf8") ?? "{}");
        const request = createRequest(loaded);

        expect(target).not.toHaveProperty("publishCredential");
        expect(target?.requestedOutput).toEqual({ type: "github", repository: "acme/acme-cli", mode: "release" });
        expect(request).not.toHaveProperty("credentialSetId");
        expect(body.targets[0].output.distribution).toEqual(DISTRIBUTION);
        expect(loaded.config.targets[0]?.output).toMatchObject({ distribution: DISTRIBUTION });
        expect(DISTRIBUTION_SECRET_NAMES.filter((name) => envReads.has(name))).toEqual([]);
        expect(findTransportedCanaries(loaded, request)).toEqual([]);
    });

    it.each([
        [
            "root",
            {
                output: {
                    delivery: "github",
                    github: { repository: "acme/sdk", mode: "pull-request", credentials: GITHUB_CREDENTIALS }
                },
                targets: [{ language: "typescript", package: { packageName: "@acme/sdk" } }]
            }
        ],
        [
            "target",
            {
                targets: [
                    {
                        language: "typescript",
                        package: { packageName: "@acme/sdk" },
                        output: {
                            delivery: "github",
                            github: { repository: "acme/sdk", mode: "pull-request", credentials: GITHUB_CREDENTIALS }
                        }
                    }
                ]
            }
        ],
        [
            "root and overriding target",
            {
                output: {
                    delivery: "github",
                    github: { repository: "acme/root", credentials: GITHUB_CREDENTIALS }
                },
                targets: [
                    {
                        language: "typescript",
                        package: { packageName: "@acme/sdk" },
                        output: {
                            delivery: "github",
                            github: { repository: "acme/sdk", mode: "pull-request", credentials: GITHUB_CREDENTIALS }
                        }
                    }
                ]
            }
        ]
    ])("strips %s GitHub credentials from the uploaded body and keeps GitHub delivery", async (_name, document) => {
        stubCanaryEnv();
        const configPath = await writeSdkConfig(temporaryDirectories, document);

        const loaded = await loadSdkConfigV1(configPath);
        const target = loaded.payload.targets[0];
        const body = JSON.parse(target?.body.toString("utf8") ?? "{}");
        const request = createRequest(loaded);

        expect(target?.requestedOutput).toEqual({ type: "github", repository: "acme/sdk", mode: "pull-request" });
        expect(target).not.toHaveProperty("publishCredential");
        expect(request).not.toHaveProperty("credentialSetId");
        for (const output of [body.output, body.targets[0].output]) {
            if (output != null) {
                expect(output.github).not.toHaveProperty("credentials");
                expect(output.github.repository).toMatch(/^acme\//);
            }
        }
        expect(loaded.config.output?.delivery === "github" ? loaded.config.output.github : {}).not.toHaveProperty(
            "credentials"
        );
        expect(findTransportedCanaries(loaded, request)).toEqual([]);
    });

    it("strips GitHub credentials during preview without resolving them", async () => {
        const configPath = await writeSdkConfig(temporaryDirectories, {
            targets: [
                {
                    language: "typescript",
                    package: { packageName: "@acme/sdk" },
                    output: {
                        delivery: "github",
                        github: { repository: "acme/sdk", credentials: { token: "${MISSING_GH_TOKEN}" } }
                    }
                }
            ]
        });

        const loaded = await loadSdkConfigV1(configPath, true);

        expect(loaded.payload.targets[0]?.requestedOutput).toEqual({ type: "download" });
        expect(loaded.payload.targets[0]?.body.toString("utf8")).not.toContain("MISSING_GH_TOKEN");
    });

    it("keeps CLI npm publication, distribution, and GitHub credentials out of the CLI GitHub request", async () => {
        stubCanaryEnv();
        const configPath = await writeSdkConfig(temporaryDirectories, {
            targets: [
                {
                    language: "cli",
                    package: { packageName: "acme" },
                    output: {
                        delivery: "github",
                        github: { repository: "acme/acme-cli", credentials: GITHUB_CREDENTIALS },
                        publish: { registry: "npm", token: "${CANARY_NPM_TOKEN}" },
                        distribution: DISTRIBUTION
                    }
                }
            ]
        });

        const loaded = await loadSdkConfigV1(configPath);
        const target = loaded.payload.targets[0];
        const body = JSON.parse(target?.body.toString("utf8") ?? "{}");
        const request = createRequest(loaded);

        expect(target?.requestedOutput).toEqual({
            type: "github",
            repository: "acme/acme-cli",
            publish: { registry: "npm" }
        });
        expect(target).not.toHaveProperty("publishCredential");
        expect(request).not.toHaveProperty("credentialSetId");
        expect(body.targets[0].output).toEqual({
            delivery: "github",
            github: { repository: "acme/acme-cli" },
            publish: { registry: "npm" },
            distribution: DISTRIBUTION
        });
        expect(findTransportedCanaries(loaded, request)).toEqual([]);
    });

    it.each([
        ["a non-object", "ghp_literal_canary_value", "GitHub output credentials must be an object"],
        ["a non-string field", { token: 1234567890 }, "GitHub output credential token must be a string"],
        [
            "an unknown field",
            { secret: "ghp_literal_canary_value" },
            "GitHub output does not support credential field secret"
        ]
    ])("rejects %s GitHub credential without echoing it", async (_name, credentials, message) => {
        const configPath = await writeSdkConfig(temporaryDirectories, {
            targets: [
                {
                    language: "typescript",
                    package: { packageName: "@acme/sdk" },
                    output: { delivery: "github", github: { repository: "acme/sdk", credentials } }
                }
            ]
        });

        const error = await loadSdkConfigV1(configPath, true).catch((cause: unknown) => cause);

        expect(error).toBeInstanceOf(Error);
        expect(String(error)).toContain(message);
        expect(String(error)).not.toContain("ghp_literal_canary_value");
        expect(String(error)).not.toContain("1234567890");
    });
});

function stubCanaryEnv(): void {
    for (const [name, value] of Object.entries(CANARY_ENV)) {
        vi.stubEnv(name, value);
    }
}

function recordEnvReads(): Set<string> {
    const reads = new Set<string>();
    const env = process.env;
    process.env = new Proxy(env, {
        get(target, property, receiver) {
            if (typeof property === "string") {
                reads.add(property);
            }
            return Reflect.get(target, property, receiver);
        }
    });
    return reads;
}

function createRequest(loaded: LoadedSdkConfigV1): ReturnType<typeof createFernSdkGenApiRequest> {
    const target = loaded.payload.targets[0];
    if (target == null) {
        throw new Error("Expected one SDK Config target");
    }
    return createFernSdkGenApiRequest({
        apiName: "acme",
        organization: "acme",
        cliVersion: "0.0.0",
        generatorInvocation: {
            name: target.language === "cli" ? "fernapi/fern-cli-generator" : "fernapi/fern-typescript-sdk",
            version: "4.0.0",
            language: target.language,
            config: {},
            keywords: [],
            smartCasing: true,
            smartCasingDigitWordBoundary: false,
            disableExamples: false,
            outputMode: FernFiddle.OutputMode.downloadFiles({})
        } as unknown as generatorsYml.GeneratorInvocation,
        sdkVersion: "1.0.0",
        specsTarGzBuffer: Buffer.from("specs"),
        payload: { payloadKind: "sdk-config-v1", body: target.body },
        requestedOutput: target.requestedOutput,
        publishCredential: target.publishCredential
    });
}

function findTransportedCanaries(loaded: LoadedSdkConfigV1, request: unknown): string[] {
    const transport = [
        JSON.stringify(request),
        JSON.stringify(
            loaded.payload.targets.map(({ body, ...target }) => ({ ...target, body: body.toString("utf8") }))
        ),
        ...loaded.payload.targets.map((target) => target.body.toString("utf8"))
    ].join("\n");
    return FORBIDDEN_IN_TRANSPORT.filter((forbidden) => transport.includes(forbidden));
}

async function writeSdkConfig(temporaryDirectories: string[], document: Record<string, unknown>): Promise<string> {
    const directory = await mkdtemp(join(tmpdir(), "fern-sdk-config-credential-guard-"));
    temporaryDirectories.push(directory);
    const configPath = join(directory, "sdk-config.yml");
    await writeFile(
        configPath,
        YAML.stringify({
            schemaVersion: "sdk-config/v1",
            sdkName: "acme",
            source: { specs: [{ id: "openapi", type: "openapi", path: "./openapi.yml" }] },
            api: {},
            client: {},
            package: {},
            docs: {},
            generation: {},
            ...document
        })
    );
    return configPath;
}
