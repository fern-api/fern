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
        expect(generator(result).output).toEqual({
            location: "github",
            repository: "acme/cli",
            mode: "pull-request",
            branch: "main"
        });
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
