import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type BuildOutcome, GenerateWorld, generate, OPENAPI, sdkConfigYml } from "./sdkGenerateHarness.js";
import { TEST_TOKEN } from "./sdkGenerateMocks.js";

vi.mock("@fern-api/login", async () => (await import("./sdkGenerateMocks.js")).loginModule());
vi.mock("@fern-api/posthog-manager", async (importOriginal) =>
    (await import("./sdkGenerateMocks.js")).posthogModule(
        await importOriginal<typeof import("@fern-api/posthog-manager")>()
    )
);

// SDK Config targets, delivered every way sdk-config.yml can ask for: the request the command submits to sdk-gen-api,
// the credentials file that travels beside it, and what the command does with each outcome.

/** One target. `output` is the YAML of its `output:` section, indented by 4. */
function target(language: string, output: string, extra = ""): string {
    return `  - language: ${language}
${extra}    output:
${output
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => `      ${line}`)
    .join("\n")}
`;
}

const FILES = (language: string): string => `delivery: files\npath: ./generated/${language}`;

/** The package settings a target needs to publish. */
const PACKAGE: Record<string, string> = {
    typescript: '    package:\n      packageName: "@acme/sdk"\n',
    python: "    package:\n      packageName: acme-py\n",
    java: "    package:\n      groupId: com.acme\n      artifactId: sdk\n",
    rust: "    package:\n      packageName: acme-crate\n",
    csharp: "    package:\n      packageName: Acme.Sdk\n",
    go: "    package:\n      modulePath: github.com/acme/sdk-go\n",
    php: "    package:\n      packageName: acme/sdk\n",
    ruby: "    package:\n      packageName: acme-gem\n"
};

/** A target that carries the package settings of its language. */
const publishing = (language: string, output: string): string => target(language, output, PACKAGE[language]);

describe("fern generate: SDK Config deliveries", { timeout: 120_000 }, () => {
    let world: GenerateWorld;

    beforeEach(async () => {
        world = new GenerateWorld();
        await world.setup();
        vi.stubEnv("NPM_TOKEN", "npm-secret");
        vi.stubEnv("PYPI_USER", "pypi-user");
        vi.stubEnv("PYPI_PASSWORD", "pypi-secret");
        vi.stubEnv("MAVEN_USER", "maven-user");
        vi.stubEnv("MAVEN_PASSWORD", "maven-secret");
        vi.stubEnv("MAVEN_KEY_ID", "maven-key-id");
        vi.stubEnv("MAVEN_SIGNING_PASSWORD", "maven-signing-secret");
        vi.stubEnv("MAVEN_SECRET_KEY", "maven-secret-key");
        vi.stubEnv("CRATES_TOKEN", "crates-secret");
    });

    afterEach(() => world.teardown());

    async function run(
        targets: string,
        { args = {}, header = "" }: { args?: Record<string, unknown>; header?: string } = {}
    ) {
        return await generate(world, {
            files: { "openapi/openapi.yml": OPENAPI, "sdk-config.yml": sdkConfigYml(targets, header) },
            args
        });
    }

    const requested = (language: string) =>
        world.sdkGenApi.submitted.find((submitted) => submitted.language === language)?.requestedOutput;

    describe("downloading files", () => {
        it("asks for a download, and writes the artifact into the path", async () => {
            world.sdkGenApi.willBuild("typescript", { files: { "src/index.ts": "export {}" } });
            const result = await run(target("typescript", FILES("typescript")));

            expect(result.failed).toBe(false);
            expect(requested("typescript")).toEqual({ type: "download" });
            expect(world.sdkGenApi.builds[0]?.credentials).toBeUndefined();
            expect(await result.generated("fern")).toEqual(["generated/typescript/src/index.ts"]);
            expect(result.logged("Downloaded to ")).toBe(true);
        });

        it("downloads into generated/<language> when files delivery names no path", async () => {
            const result = await run(target("go", "delivery: files"));

            expect(result.failed).toBe(false);
            expect(await result.generated("fern")).toEqual(["generated/go/README.md"]);
        });

        it("uses the target's output rather than the root output when a target has its own", async () => {
            const result = await run(target("php", "delivery: files\npath: ./out/php"), {
                header: "output:\n  delivery: files\n  path: ./out/root\n"
            });

            expect(result.failed).toBe(false);
            expect(await result.list("fern/out")).toEqual(["php/README.md"]);
        });

        it("inherits the root output for a target that has none", async () => {
            const result = await run("  - language: php\n", {
                header: "output:\n  delivery: files\n  path: ./out/root\n"
            });

            expect(result.failed).toBe(false);
            expect(await result.list("fern/out")).toEqual(["root/README.md"]);
        });
    });

    describe("downloading a zip", () => {
        it("keeps the artifact as a zip at generated/<language>.zip", async () => {
            const result = await run(target("python", "delivery: zip"));

            expect(result.failed).toBe(false);
            expect(requested("python")).toEqual({ type: "download" });
            expect(await result.generated("fern")).toEqual(["generated/python.zip"]);
            const bytes = await readFile(path.join(result.directory, "fern", "generated", "python.zip"));
            expect(bytes.subarray(0, 4).toString("hex")).toBe("504b0304");
        });

        it("writes the zip to the file name the target gives, below the config's directory", async () => {
            const result = await run(target("python", "delivery: zip\nfileName: dist/acme-python.zip"));

            expect(result.failed).toBe(false);
            expect(await result.list("fern/dist")).toEqual(["acme-python.zip"]);
        });

        it("numbers the default zip names of targets that share a language", async () => {
            const result = await run(
                `${target("python", "delivery: zip", "    sdkName: one\n")}${target("python", "delivery: zip", "    sdkName: two\n")}`
            );

            expect(result.failed).toBe(false);
            expect(await result.generated("fern")).toEqual(["generated/python-0.zip", "generated/python-1.zip"]);
        });
    });

    describe("publishing directly to a registry", () => {
        const secrets = [
            "npm-secret",
            "pypi-user",
            "pypi-secret",
            "maven-user",
            "maven-secret",
            "maven-key-id",
            "maven-signing-secret",
            "maven-secret-key",
            "crates-secret"
        ];

        it("sends each registry's credentials in the credentials file, and nowhere else", async () => {
            const result = await run(
                [
                    publishing(
                        "typescript",
                        `delivery: files\npath: ./generated/typescript\npublish:\n  registry: npm\n  url: https://npm.acme.test\n  token: \${NPM_TOKEN}`
                    ),
                    publishing(
                        "python",
                        "delivery: files\npath: ./generated/python\npublish:\n  registry: pypi\n  username: ${PYPI_USER}\n  password: ${PYPI_PASSWORD}"
                    ),
                    publishing(
                        "java",
                        "delivery: files\npath: ./generated/java\npublish:\n  registry: maven\n  username: ${MAVEN_USER}\n  password: ${MAVEN_PASSWORD}\n  signature:\n    keyId: ${MAVEN_KEY_ID}\n    password: ${MAVEN_SIGNING_PASSWORD}\n    secretKey: ${MAVEN_SECRET_KEY}"
                    ),
                    publishing(
                        "rust",
                        "delivery: files\npath: ./generated/rust\npublish:\n  registry: crates\n  token: ${CRATES_TOKEN}"
                    )
                ].join("")
            );

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.builds).toHaveLength(1);
            const [build] = world.sdkGenApi.builds;
            const byLanguage = Object.fromEntries(
                (build?.request.targets ?? []).map((submitted) => [submitted.language, submitted])
            );
            expect(byLanguage.typescript?.requestedOutput).toEqual({
                type: "publish",
                publish: { registry: "npm", url: "https://npm.acme.test" }
            });
            expect(byLanguage.python?.requestedOutput).toEqual({ type: "publish", publish: { registry: "pypi" } });
            expect(byLanguage.java?.requestedOutput).toEqual({ type: "publish", publish: { registry: "maven" } });
            expect(byLanguage.rust?.requestedOutput).toEqual({ type: "publish", publish: { registry: "crates" } });

            expect(build?.request.credentialSetId).toMatch(/^[0-9a-f]{8}-/);
            expect(build?.credentials?.schemaVersion).toBe("fern-publish-credentials/v1");
            expect(build?.credentials?.credentialSetId).toBe(build?.request.credentialSetId);
            const credentials = Object.fromEntries(
                (build?.credentials?.targets ?? []).map(({ targetId, ...credential }) => [
                    build?.request.targets.find((submitted) => submitted.targetId === targetId)?.language,
                    credential
                ])
            );
            expect(credentials).toEqual({
                typescript: { registry: "npm", token: "npm-secret" },
                python: { registry: "pypi", username: "pypi-user", password: "pypi-secret" },
                java: {
                    registry: "maven",
                    username: "maven-user",
                    password: "maven-secret",
                    signature: {
                        keyId: "maven-key-id",
                        password: "maven-signing-secret",
                        secretKey: "maven-secret-key"
                    }
                },
                rust: { registry: "crates", token: "crates-secret" }
            });

            // A secret is in the credentials part and in no other: not the request, not a payload, not a log.
            const requestText = JSON.stringify(build?.request);
            const payloadText = (build?.payloads ?? []).map((payload) => payload.body.toString("utf8")).join("\n");
            for (const secret of secrets) {
                expect(requestText).not.toContain(secret);
                expect(payloadText).not.toContain(secret);
                expect(result.logs.join("\n")).not.toContain(secret);
            }
            expect(payloadText).not.toContain("NPM_TOKEN");
        });

        it("authorizes the build with the user's token and organization", async () => {
            await run(publishing("typescript", FILES("typescript")));

            expect(world.sdkGenApi.builds[0]?.headers).toMatchObject({
                Authorization: `Bearer ${TEST_TOKEN}`,
                "X-Fern-Organization-Id": "acme"
            });
        });

        it("reports what the registry published to the GitHub Actions run", async () => {
            const actions = await world.captureGithubActions();
            world.sdkGenApi.willBuild("typescript", {
                actualVersion: "1.0.0",
                publication: {
                    status: "success",
                    publishTarget: { type: "npm", identifier: "https://www.npmjs.com/package/@acme/sdk/v/1.0.0" },
                    output: { packageName: "@acme/sdk" }
                }
            });
            const result = await run(
                publishing(
                    "typescript",
                    `delivery: files\npath: ./generated/typescript\npublish:\n  registry: npm\n  token: \${NPM_TOKEN}`
                )
            );

            expect(result.failed).toBe(false);
            expect(actions.annotations()).toEqual([
                "::notice title=fernapi/fern-typescript-sdk (group=sdk-config) → Published to npm::1.0.0 → https://www.npmjs.com/package/@acme/sdk/v/1.0.0"
            ]);
            expect(await actions.summary()).toBe(
                "📦 **fernapi/fern-typescript-sdk** → [npm 1.0.0](https://www.npmjs.com/package/@acme/sdk/v/1.0.0)\n"
            );
        });

        it("fails, without submitting anything, when a variable the credentials name is not set", async () => {
            const result = await run(
                publishing(
                    "typescript",
                    `delivery: files\npath: ./generated/typescript\npublish:\n  registry: npm\n  token: \${UNSET_NPM_TOKEN}`
                )
            );

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("UNSET_NPM_TOKEN");
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("fails, without submitting anything, when the registry needs a credential the config does not give", async () => {
            const result = await run(
                publishing("typescript", "delivery: files\npath: ./generated/typescript\npublish:\n  registry: npm")
            );

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("Direct npm publication through sdk-gen-api requires token");
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("refuses a registry that is not served over https", async () => {
            const result = await run(
                publishing(
                    "typescript",
                    `delivery: files\npath: ./generated/typescript\npublish:\n  registry: npm\n  url: http://npm.acme.test\n  token: \${NPM_TOKEN}`
                )
            );

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("Direct registry URL must use HTTPS");
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("refuses OIDC for a direct publish", async () => {
            const result = await run(
                publishing(
                    "typescript",
                    "delivery: files\npath: ./generated/typescript\npublish:\n  registry: npm\n  token: OIDC"
                )
            );

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("does not support OIDC credentials");
        });

        it.each([
            ["nuget", "csharp"],
            ["go", "go"],
            ["composer", "php"]
        ])("cannot publish to %s directly: it needs the GitHub delivery", async (registry, language) => {
            const result = await run(
                publishing(
                    language,
                    `delivery: files\npath: ./generated/${language}\npublish:\n  registry: ${registry}`
                )
            );

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain(
                `sdk-gen-api does not support direct ${registry} registry publication`
            );
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("cannot publish to RubyGems directly", async () => {
            const result = await run(
                publishing("ruby", "delivery: files\npath: ./generated/ruby\npublish:\n  registry: rubygems")
            );

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("Direct RubyGems publishing is not supported");
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("does not publish a preview, and does not ask for its credentials", async () => {
            const result = await run(
                publishing(
                    "typescript",
                    `delivery: files\npath: ./generated/typescript\npublish:\n  registry: npm\n  token: \${UNSET_NPM_TOKEN}`
                ),
                { args: { preview: true } }
            );

            expect(result.failed).toBe(false);
            expect(requested("typescript")).toEqual({ type: "download" });
            expect(world.sdkGenApi.builds[0]?.credentials).toBeUndefined();
        });
    });

    describe("delivering to GitHub", () => {
        const github = (lines: string, extra = ""): string =>
            `delivery: github\ngithub:\n${lines
                .split("\n")
                .map((line) => `  ${line}`)
                .join("\n")}${extra}`;

        it.each([
            ["release", "release"],
            ["pull-request", "pull-request"],
            ["push", "push"],
            ["commit", "push"],
            ["commit-and-release", "release"]
        ])("sends mode %s as %s", async (mode, expected) => {
            world.sdkGenApi.willBuild("typescript", {
                publication: {
                    status: "success",
                    publishTarget: { type: "github", identifier: "acme/sdk-ts" },
                    output: {}
                }
            });
            const result = await run(target("typescript", github(`repository: acme/sdk-ts\nmode: ${mode}`)));

            expect(result.failed).toBe(false);
            expect(requested("typescript")).toEqual({ type: "github", repository: "acme/sdk-ts", mode: expected });
            // GitHub delivery downloads nothing: there is no output path to write to.
            expect(await result.generated("fern")).toEqual([]);
        });

        it("sends the host, branch, reviewers and the workflows opt-out", async () => {
            world.sdkGenApi.willBuild("typescript", {
                publication: {
                    status: "success",
                    publishTarget: { type: "github", identifier: "acme/sdk-ts" },
                    output: { pullRequestUrl: "https://github.acme.test/acme/sdk-ts/pull/3" }
                }
            });
            const result = await run(
                target(
                    "typescript",
                    github(
                        "repository: acme/sdk-ts\nhost: github.acme.test\nbranch: sdk-update\nmode: pull-request\nreviewers:\n  users: [alice]\n  teams: [core]\nworkflows: false"
                    )
                )
            );

            expect(result.failed).toBe(false);
            expect(requested("typescript")).toEqual({
                type: "github",
                repository: "acme/sdk-ts",
                host: "github.acme.test",
                branch: "sdk-update",
                mode: "pull-request",
                reviewers: { users: ["alice"], teams: ["core"] },
                workflows: false
            });
        });

        it("sends replay, verify and skip-if-no-diff when they are asked for", async () => {
            world.sdkGenApi.willBuild("typescript", {
                publication: {
                    status: "success",
                    publishTarget: { type: "github", identifier: "acme/sdk-ts" },
                    output: {}
                }
            });
            await run(target("typescript", github("repository: acme/sdk-ts")), {
                args: { verify: true, skipIfNoDiff: true, noReplay: true }
            });

            expect(requested("typescript")).toMatchObject({
                type: "github",
                replay: { enabled: false },
                verify: true,
                skipIfNoDiff: true
            });
        });

        it("hands a registry publish to the release workflow, naming the secret that holds the key", async () => {
            world.sdkGenApi.willBuild("csharp", {
                publication: {
                    status: "success",
                    publishTarget: { type: "github", identifier: "acme/sdk-cs" },
                    output: {}
                }
            });
            vi.stubEnv("NUGET_API_KEY", "nuget-secret");
            const result = await run(
                publishing(
                    "csharp",
                    github("repository: acme/sdk-cs", "\npublish:\n  registry: nuget\n  apiKey: ${NUGET_API_KEY}")
                )
            );

            expect(result.failed).toBe(false);
            expect(requested("csharp")).toEqual({
                type: "github",
                repository: "acme/sdk-cs",
                publish: { registry: "nuget", apiKeyEnvironmentVariable: "NUGET_API_KEY" }
            });
            // The key's name travels, its value never does.
            expect(world.sdkGenApi.builds[0]?.rawText).not.toContain("nuget-secret");
            expect(world.sdkGenApi.builds[0]?.credentials).toBeUndefined();
        });

        it("hands a RubyGems publish to the release workflow", async () => {
            world.sdkGenApi.willBuild("ruby", {
                publication: {
                    status: "success",
                    publishTarget: { type: "github", identifier: "acme/sdk-rb" },
                    output: {}
                }
            });
            const result = await run(
                publishing("ruby", github("repository: acme/sdk-rb", "\npublish:\n  registry: rubygems"))
            );

            expect(result.failed).toBe(false);
            expect(requested("ruby")).toMatchObject({ type: "github", publish: { registry: "rubygems" } });
        });

        // Trusted publishing is only accepted for the cli target, which the generated workflow publishes itself.
        it("rejects npm trusted publishing for an SDK target", async () => {
            const result = await run(
                publishing(
                    "typescript",
                    github("repository: acme/sdk-ts", "\npublish:\n  registry: npm\n  trustedPublishing: true")
                )
            );

            expect(result.failed).toBe(true);
            expect(result.failureMessage).toContain("Direct npm publication does not support option trustedPublishing");
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("strips GitHub credentials from the document it uploads", async () => {
            vi.stubEnv("GH_TOKEN", "github-secret");
            world.sdkGenApi.willBuild("typescript", {
                publication: {
                    status: "success",
                    publishTarget: { type: "github", identifier: "acme/sdk-ts" },
                    output: {}
                }
            });
            const result = await run(
                target("typescript", github("repository: acme/sdk-ts\ncredentials:\n  token: ${GH_TOKEN}"))
            );

            expect(result.failed).toBe(false);
            expect(world.sdkGenApi.builds[0]?.rawText).not.toContain("github-secret");
            expect(world.sdkGenApi.builds[0]?.rawText).not.toContain("GH_TOKEN");
        });

        describe("what sdk-gen-api reports", () => {
            const pullRequest = (output: Record<string, unknown>): BuildOutcome => ({
                publication: { status: "success", publishTarget: { type: "github", identifier: "acme/sdk-ts" }, output }
            });
            const prTarget = target("typescript", github("repository: acme/sdk-ts\nmode: pull-request"));

            it("logs the pull request it opened", async () => {
                world.sdkGenApi.willBuild(
                    "typescript",
                    pullRequest({ pullRequestUrl: "https://github.com/acme/sdk-ts/pull/7?token=1#frag" })
                );
                const result = await run(prTarget);

                expect(result.failed).toBe(false);
                // Only the origin and path are printed: a query string or fragment never is.
                expect(result.logged("Pull request: https://github.com/acme/sdk-ts/pull/7")).toBe(true);
                expect(result.logs.join("\n")).not.toContain("token=1");
            });

            it("says nothing was delivered when there were no changes, even if a link came back", async () => {
                world.sdkGenApi.willBuild(
                    "typescript",
                    pullRequest({ noChangesDetected: true, pullRequestUrl: "https://github.com/acme/sdk-ts/pull/7" })
                );
                const result = await run(prTarget);

                expect(result.failed).toBe(false);
                expect(result.logged("No changes detected for acme/sdk-ts; nothing was delivered to GitHub.")).toBe(
                    true
                );
                expect(result.logged("Pull request:")).toBe(false);
            });

            it("warns when a pull request was asked for and no link came back", async () => {
                world.sdkGenApi.willBuild("typescript", pullRequest({}));
                const result = await run(prTarget);

                expect(result.failed).toBe(false);
                expect(result.warnings.join("\n")).toContain(
                    "sdk-gen-api did not return a pull request link for acme/sdk-ts."
                );
            });

            it("warns, and prints nothing, for a link that is not https", async () => {
                world.sdkGenApi.willBuild(
                    "typescript",
                    pullRequest({ pullRequestUrl: "http://github.com/acme/sdk-ts/pull/7" })
                );
                const result = await run(prTarget);

                expect(result.failed).toBe(false);
                expect(result.warnings.join("\n")).toContain(
                    "sdk-gen-api returned a pull request link for acme/sdk-ts that was not a safe HTTPS URL."
                );
                expect(result.logs.join("\n")).not.toContain("http://github.com");
            });

            it("does not warn about a missing link for a push", async () => {
                world.sdkGenApi.willBuild("typescript", pullRequest({}));
                const result = await run(target("typescript", github("repository: acme/sdk-ts\nmode: push")));

                expect(result.failed).toBe(false);
                expect(result.warnings.join("\n")).not.toContain("pull request link");
            });

            it("fails when the build succeeded but never confirmed the delivery", async () => {
                const result = await run(prTarget);

                expect(result.failed).toBe(true);
                expect(result.failureMessage).toContain(
                    "sdk-gen-api reported the build as succeeded but did not confirm the GitHub delivery to acme/sdk-ts"
                );
            });

            it("fails, with the code and reasons, when the delivery failed", async () => {
                world.sdkGenApi.willBuild("typescript", {
                    publication: {
                        status: "failure",
                        publishTarget: { type: "github", identifier: "acme/sdk-ts" },
                        error: {
                            code: "github_app_not_installed",
                            message: "The Fern GitHub App is not installed",
                            reason: "app_missing",
                            detail: "Install it on acme/sdk-ts"
                        }
                    }
                });
                const result = await run(prTarget);

                expect(result.failed).toBe(true);
                expect(result.errors.join("\n")).toContain(
                    "sdk-gen-api publication failed (github_app_not_installed): The Fern GitHub App is not installed: Install it on acme/sdk-ts [app_missing]"
                );
                expect(await result.generated("fern")).toEqual([]);
            });
        });
    });

    describe("what the build reports back", () => {
        it("fails a target whose build failed, with its code and message, and writes nothing for it", async () => {
            world.sdkGenApi.willBuild("typescript", { failure: { code: "GENERATOR_CRASHED", message: "boom" } });
            const result = await run(target("typescript", FILES("typescript")));

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain("GENERATOR_CRASHED: boom");
            expect(await result.generated("fern")).toEqual([]);
        });

        it("fails a target that succeeded without an artifact", async () => {
            world.sdkGenApi.willBuild("typescript", { noArtifact: true });
            const result = await run(target("typescript", FILES("typescript")));

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain("sdk-gen-api target completed without an artifact URL");
        });

        it("fails, saying so, when the artifact cannot be downloaded", async () => {
            world.sdkGenApi.willBuild("typescript", { artifactDownloadFails: true });
            const result = await run(target("typescript", FILES("typescript")));

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain("Failed to download files");
            expect(await result.generated("fern")).toEqual([]);
        });

        it("fails when the build cannot be submitted, and redacts the token from what the server said", async () => {
            world.sdkGenApi.failSubmission(500, { message: `denied for ${TEST_TOKEN}` });
            const result = await run(target("typescript", FILES("typescript")));

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain("Failed to submit sdk-gen-api build: denied for ");
            expect(result.logs.join("\n")).not.toContain(TEST_TOKEN);
        });

        it("fails when the build cannot be polled", async () => {
            world.sdkGenApi.failPolling();
            const result = await run(target("typescript", FILES("typescript")));

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain("Failed to poll sdk-gen-api build");
        });

        it("fails, naming the origin, when sdk-gen-api's origin is not configured", async () => {
            vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", undefined);
            vi.stubEnv("DEFAULT_SDK_GEN_API_ORIGIN", undefined);
            const result = await run(target("typescript", FILES("typescript")));

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                "FERN_SDK_GEN_API_ORIGIN is required when sdk-gen-api generation is enabled"
            );
            expect(world.sdkGenApi.builds).toEqual([]);
        });

        it("refuses an origin that is not https", async () => {
            vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "http://sdk-gen-api.example.com");
            const result = await run(target("typescript", FILES("typescript")));

            expect(result.failed).toBe(true);
            expect(result.errors.join("\n")).toContain(
                "FERN_SDK_GEN_API_ORIGIN must use HTTPS unless it targets localhost"
            );
        });
    });
});
