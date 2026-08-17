import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { describe, expect, it } from "vitest";
import { BaseGoCustomConfigSchema } from "../../custom-config/BaseGoCustomConfigSchema.js";
import { resolveRootImportPath, resolveRootModulePath } from "../resolveRootImportPath.js";

function buildConfig({ version }: { version: string }): FernGeneratorExec.GeneratorConfig {
    return {
        dryRun: false,
        irFilepath: "<placeholder>",
        output: {
            path: "<placeholder>",
            mode: FernGeneratorExec.OutputMode.github({
                version,
                repoUrl: "https://github.com/acme/acme-go"
            })
        },
        organization: "acme",
        workspaceName: "acme",
        environment: FernGeneratorExec.GeneratorEnvironment.local(),
        whitelabel: false,
        writeUnitTests: false,
        generateOauthClients: false,
        customConfig: {}
    };
}

const CUSTOM_CONFIG_WITH_VERSIONED_IMPORT_PATH: BaseGoCustomConfigSchema = {
    importPath: "github.com/acme/acme-go/v46"
};

describe("resolveRootModulePath", () => {
    it("appends the major version suffix for v2+ releases", () => {
        expect(
            resolveRootModulePath({
                config: buildConfig({ version: "3.1.0" }),
                customConfig: { importPath: "github.com/acme/acme-go" }
            })
        ).toBe("github.com/acme/acme-go/v3");
    });

    it("does not append a suffix for v0 and v1 releases", () => {
        expect(
            resolveRootModulePath({
                config: buildConfig({ version: "1.2.3" }),
                customConfig: { importPath: "github.com/acme/acme-go" }
            })
        ).toBe("github.com/acme/acme-go");
    });

    it("does not double the suffix when the configured import path is already versioned", () => {
        expect(
            resolveRootModulePath({
                config: buildConfig({ version: "34.0.0" }),
                customConfig: CUSTOM_CONFIG_WITH_VERSIONED_IMPORT_PATH
            })
        ).toBe("github.com/acme/acme-go/v46");
    });

    // Mirrors module.SplitPathVersion, which the Go generator calls directly. Every case
    // below is one row of that function's behavior for the paths under discussion.
    it.each([
        { importPath: "github.com/plaid/plaid-go/v46", expected: "github.com/plaid/plaid-go/v46" },
        { importPath: "github.com/plaid/plaid-go", expected: "github.com/plaid/plaid-go/v2" },
        { importPath: "github.com/acme/acme-go/v2", expected: "github.com/acme/acme-go/v2" }
    ])("resolves $importPath to $expected", ({ importPath, expected }) => {
        expect(
            resolveRootModulePath({
                config: buildConfig({ version: "2.0.0" }),
                customConfig: { importPath }
            })
        ).toBe(expected);
    });

    // These paths are not legal Go module paths: only v2 and above may carry a suffix, and
    // it may not be zero-padded. Appending would silently emit an unbuildable ".../v0/v2".
    it.each(["v0", "v01", "v1", "v1.2"])(
        "surfaces a configuration error when the configured path ends in %s",
        (segment) => {
            expect(() =>
                resolveRootModulePath({
                    config: buildConfig({ version: "2.0.0" }),
                    customConfig: { importPath: `github.com/acme/acme-go/${segment}` }
                })
            ).toThrow(/isn't a valid Go major version suffix/);
        }
    );
});

describe("resolveRootImportPath", () => {
    it("does not double the suffix when the configured import path is already versioned", () => {
        expect(
            resolveRootImportPath({
                config: buildConfig({ version: "34.0.0" }),
                customConfig: CUSTOM_CONFIG_WITH_VERSIONED_IMPORT_PATH
            })
        ).toBe("github.com/acme/acme-go/v46");
    });
});
