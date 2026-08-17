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

    it("leaves a configured v1 suffix alone rather than doubling it", () => {
        expect(
            resolveRootModulePath({
                config: buildConfig({ version: "2.0.0" }),
                customConfig: { importPath: "github.com/acme/acme-go/v1" }
            })
        ).toBe("github.com/acme/acme-go/v1");
    });

    it.each(["v0", "v01"])("appends the suffix when the configured path ends in %s", (segment) => {
        expect(
            resolveRootModulePath({
                config: buildConfig({ version: "2.0.0" }),
                customConfig: { importPath: `github.com/acme/acme-go/${segment}` }
            })
        ).toBe(`github.com/acme/acme-go/${segment}/v2`);
    });
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
