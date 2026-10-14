import { describe, expect, it } from "vitest";

import { mapSdkConfigToGeneratorsYml } from "../../mapSdkConfigToGeneratorsYml.js";
import { cliIr, codes, errorCodes, facts, warningCodes } from "../helpers.js";

function map(overrides: Record<string, unknown> = {}, outDir = "/work") {
    return mapSdkConfigToGeneratorsYml(cliIr(overrides), {
        configDir: "/work",
        outDir,
        generatorVersion: "0.49.0",
        specFacts: [facts()]
    });
}

const GITHUB_TARGET = {
    language: "cli",
    sourceOrigin: "postman",
    sdkName: "acme",
    sdkVersion: "0.0.0",
    apiName: "api",
    organizationName: "acme"
};

function generator(result: ReturnType<typeof map>): Record<string, unknown> {
    const groups = result.generatorsYml.groups;
    const cli = typeof groups === "object" && groups != null && "cli" in groups ? groups.cli : undefined;
    const generators = typeof cli === "object" && cli != null && "generators" in cli ? cli.generators : undefined;
    const first = Array.isArray(generators) ? generators[0] : undefined;
    return typeof first === "object" && first != null ? { ...first } : {};
}

describe("generator rule", () => {
    it("writes one cli group with fernapi/fern-cli-generator and no ir-version", () => {
        const result = map();
        expect(Object.keys(result.generatorsYml.groups ?? {})).toEqual(["cli"]);
        expect(generator(result)).toEqual({
            name: "fernapi/fern-cli-generator",
            version: "0.49.0",
            output: { location: "local-file-system", path: "./generated/cli" }
        });
    });

    it("maps packageName, description, repository, homepage and keywords into config.packageIdentity", () => {
        const result = map({
            package: {
                packageName: "acme-cli",
                description: "Acme CLI",
                repository: "https://github.com/acme/cli",
                homepage: "https://acme.test",
                keywords: ["acme"]
            }
        });
        expect(generator(result).config).toEqual({
            packageIdentity: {
                name: "acme-cli",
                description: "Acme CLI",
                repository: "https://github.com/acme/cli",
                homepage: "https://acme.test",
                keywords: ["acme"]
            }
        });
    });

    it('formats authors as "Name <email>", or the name alone', () => {
        const result = map({ package: { authors: [{ name: "Ada", email: "ada@acme.test" }, { name: "Bob" }] } });
        expect(generator(result).config).toEqual({ packageIdentity: { authors: ["Ada <ada@acme.test>", "Bob"] } });
    });

    it("maps an SPDX license to metadata.license and packageIdentity.license", () => {
        const result = map({ package: { license: { type: "MIT" } } });
        expect(generator(result).metadata).toEqual({ license: "MIT" });
        expect(generator(result).config).toEqual({ packageIdentity: { license: "MIT" } });
    });

    it.each([
        ["APACHE", "Apache-2.0", { license: "Apache-2.0" }],
        ["apache", "Apache-2.0", { license: "Apache-2.0" }],
        ["Apache-2.0", "Apache-2.0", { license: "Apache-2.0" }],
        ["apache-2.0", "Apache-2.0", { license: "Apache-2.0" }],
        ["mit", "MIT", { license: "MIT" }],
        ["gpl-3.0-only", "GPL-3.0-only", undefined],
        ["GPL3", "GPL-3.0-only", undefined],
        ["UNLICENSED", "UNLICENSED", undefined],
        ["BSD-3-Clause", "BSD-3-Clause", undefined]
    ])("maps license type %s to the SPDX id %s, and writes metadata.license only for MIT and Apache-2.0", (type, spdx, metadata) => {
        const result = map({ package: { license: { type } } });
        expect(errorCodes(result.diagnostics)).toEqual([]);
        expect(generator(result).config).toEqual({ packageIdentity: { license: spdx } });
        expect(generator(result).metadata).toEqual(metadata);
    });

    it("maps a custom license file to metadata.license.custom, relative to the output folder", () => {
        const result = map({ package: { license: { type: "custom", path: "./LICENSE" } } }, "/work/out");
        expect(generator(result).metadata).toEqual({ license: { custom: "../LICENSE" } });
    });

    it("maps extraDependencies and extraDevDependencies to Cargo tables, with a --locked hint", () => {
        const result = map({
            package: {
                extraDependencies: [
                    { name: "serde", version: "1" },
                    { name: "local", source: { type: "path", path: "../local" } }
                ],
                extraDevDependencies: [{ name: "insta", version: "1", features: ["yaml"] }]
            }
        });
        expect(generator(result).config).toEqual({
            extraDependencies: { serde: "1", local: { path: "../local" } },
            extraDevDependencies: { insta: { version: "1", features: ["yaml"] } }
        });
        expect(result.hints.some((hint) => hint.includes("--locked"))).toBe(true);
    });

    it("maps generation.wireTests.enabled to config.generateWireTests", () => {
        expect(generator(map({ generation: { wireTests: { enabled: true } } })).config).toEqual({
            generateWireTests: true
        });
    });

    it("copies the typed CLI generation settings into config under the generator's key names", () => {
        const cli = {
            binaryName: "Acme CLI",
            customCommands: false,
            rootGroup: "api",
            profiles: {
                enabled: true,
                commandName: "accounts",
                revokeOperation: "iam.keys.remove",
                provisionOperation: {
                    operation: "iam.keys.create",
                    credential: { username: "sid", password: "secret" },
                    revokeParameters: { Sid: "sid" }
                }
            },
            splitTypeCrates: true,
            userAgentSuffixFlag: "via"
        };
        const result = map({ generation: { language: { cli } } });
        expect(result.diagnostics).toEqual([]);
        expect(generator(result).config).toEqual(cli);
    });

    it("writes only the CLI generation settings that are set, and warns for the Go CLI options", () => {
        const result = map({ generation: { language: { cli: { binaryName: "acme", skills: true } } } });
        expect(generator(result).config).toEqual({ binaryName: "acme" });
        expect(codes(result.diagnostics)).toEqual(["warning CLI_TARGET_IGNORED_FIELD generation.language.cli.skills"]);
    });

    it("maps output.distribution to config.distribution with the generator's secret-name keys", () => {
        const result = map({
            target: GITHUB_TARGET,
            output: {
                delivery: "github",
                github: { repository: "acme/cli", mode: "release" },
                distribution: {
                    githubApp: { appIdSecretName: "PUBLISH_APP_ID", privateKeySecretName: "PUBLISH_APP_KEY" },
                    homebrew: { tap: "acme/homebrew-tap", formula: "acme", tokenSecretName: "TAP_PAT" },
                    scoop: { bucket: "acme/scoop-bucket" }
                }
            }
        });
        expect(errorCodes(result.diagnostics)).toEqual([]);
        expect(generator(result).config).toEqual({
            distribution: {
                githubApp: { appIdSecret: "PUBLISH_APP_ID", privateKeySecret: "PUBLISH_APP_KEY" },
                homebrew: { tap: "acme/homebrew-tap", formula: "acme", tokenEnvironmentVariable: "TAP_PAT" },
                scoop: { bucket: "acme/scoop-bucket" }
            }
        });
        expect(JSON.stringify(result.generatorsYml)).not.toMatch(/HOMEBREW_TAP_TOKEN|SCOOP_BUCKET_TOKEN/);
    });

    it("writes local-file-system output at output.path", () => {
        expect(generator(map({ output: { delivery: "files", path: "./sdks/cli" } })).output).toEqual({
            location: "local-file-system",
            path: "./sdks/cli"
        });
    });

    it("writes a github output block with a warning that fern generate will push", () => {
        const result = map({
            target: {
                language: "cli",
                sourceOrigin: "postman",
                sdkName: "acme",
                sdkVersion: "0.0.0",
                apiName: "api",
                organizationName: "acme"
            },
            output: { delivery: "github", github: { repository: "acme/cli", mode: "pull-request", branch: "main" } }
        });
        expect(generator(result).github).toEqual({
            repository: "acme/cli",
            mode: "pull-request",
            branch: "main"
        });
        expect(generator(result)).not.toHaveProperty("output");
        expect(codes(result.diagnostics)).toContain("warning CLI_TARGET_UNTESTED output.github");
    });

    it("warns that zip delivery becomes local files", () => {
        const result = map({ output: { delivery: "zip" } });
        expect(generator(result).output).toEqual({ location: "local-file-system", path: "./generated/cli" });
        expect(warningCodes(result.diagnostics)).toEqual(["CLI_TARGET_ZIP_AS_FILES"]);
    });

    it("produces no errors for a minimal target", () => {
        expect(errorCodes(map().diagnostics)).toEqual([]);
    });
});

describe("generator rule: npm publication", () => {
    const GITHUB = { repository: "acme/cli", mode: "release" };

    function publish(publishBlock: Record<string, unknown>, packageName = "@acme/cli") {
        return map({
            target: GITHUB_TARGET,
            package: { packageName },
            output: { delivery: "github", github: GITHUB, publish: { registry: "npm", ...publishBlock } }
        });
    }

    it("writes an npm output block next to github, with ${NPM_TOKEN} by default", () => {
        const result = publish({});
        expect(errorCodes(result.diagnostics)).toEqual([]);
        expect(generator(result)).toMatchObject({
            output: { location: "npm", "package-name": "@acme/cli", token: "${NPM_TOKEN}" },
            github: GITHUB
        });
    });

    it("writes the token environment variable as ${NAME}", () => {
        expect(generator(publish({ tokenEnvironmentVariable: "ACME_NPM_TOKEN" })).output).toEqual({
            location: "npm",
            "package-name": "@acme/cli",
            token: "${ACME_NPM_TOKEN}"
        });
    });

    it("writes token: OIDC for trusted publishing", () => {
        expect(generator(publish({ trustedPublishing: true })).output).toEqual({
            location: "npm",
            "package-name": "@acme/cli",
            token: "OIDC"
        });
    });

    it("writes a token, not OIDC, when trustedPublishing is false", () => {
        expect(generator(publish({ trustedPublishing: false })).output).toMatchObject({ token: "${NPM_TOKEN}" });
    });

    it("writes the registry url", () => {
        expect(generator(publish({ url: "https://npm.acme.test" })).output).toEqual({
            location: "npm",
            "package-name": "@acme/cli",
            url: "https://npm.acme.test",
            token: "${NPM_TOKEN}"
        });
    });

    it("omits the crate name for a scoped npm name, with a note", () => {
        const result = publish({});
        expect(generator(result).config).toBeUndefined();
        expect(result.hints.join("\n")).toContain('"@acme/cli" is the npm package name and not a valid crate name');
    });

    it("omits only the crate name and keeps the rest of packageIdentity", () => {
        const result = map({
            target: GITHUB_TARGET,
            package: { packageName: "@acme/cli", description: "Acme CLI" },
            output: { delivery: "github", github: GITHUB, publish: { registry: "npm" } }
        });
        expect(generator(result).config).toEqual({ packageIdentity: { description: "Acme CLI" } });
    });

    it("uses a valid unscoped name for both the npm package and the crate", () => {
        const result = publish({}, "acme-cli");
        expect(generator(result)).toMatchObject({
            output: { "package-name": "acme-cli" },
            config: { packageIdentity: { name: "acme-cli" } }
        });
        expect(result.hints).toEqual([]);
    });

    it("omits a crate name longer than 64 characters", () => {
        const name = `a${"b".repeat(64)}`;
        const result = publish({}, name);
        expect(generator(result)).toMatchObject({ output: { "package-name": name } });
        expect(generator(result).config).toBeUndefined();
    });

    it("keeps packageName as the crate name without npm publication, even when it is not a valid crate name", () => {
        expect(generator(map({ package: { packageName: "@acme/cli" } })).config).toEqual({
            packageIdentity: { name: "@acme/cli" }
        });
        const github = map({
            target: GITHUB_TARGET,
            package: { packageName: "@acme/cli" },
            output: { delivery: "github", github: GITHUB }
        });
        expect(generator(github).output).toBeUndefined();
        expect(generator(github).config).toEqual({ packageIdentity: { name: "@acme/cli" } });
    });

    it.each([
        "releaseBranch",
        "tolerateRepublish",
        "publishToJsr"
    ])("warns that output.publish.%s is not written, and still publishes", (field) => {
        const result = publish({ [field]: field === "releaseBranch" ? "main" : true });
        expect(codes(result.diagnostics)).toContain(`warning CLI_TARGET_IGNORED_FIELD output.publish.${field}`);
        expect(errorCodes(result.diagnostics)).toEqual([]);
        expect(generator(result).output).toMatchObject({ location: "npm" });
    });

    it.each([
        ["isPackagePrivate", true],
        ["version", "1.2.3"],
        ["shouldGeneratePublishWorkflow", false],
        ["credentialsRef", "npm-credentials"],
        ["credentials", { token: "literal" }]
    ])("rejects output.publish.%s", (field, value) => {
        const result = publish({ [field]: value });
        expect(errorCodes(result.diagnostics)).toEqual(["CLI_TARGET_UNSUPPORTED_FIELD"]);
        expect(codes(result.diagnostics)[0]).toContain(`output.publish.${field}`);
        expect(result.generatorsYml).toEqual({});
    });
});
