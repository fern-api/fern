import { FernSeedConfig } from "../config/index.js";
import { validateFixtureOutputFolders } from "../validateFixtureOutputFolders.js";

function workspaceConfig(
    fixtures: Record<string, FernSeedConfig.FixtureConfigurations[]>
): FernSeedConfig.SeedWorkspaceConfiguration {
    return { fixtures } as FernSeedConfig.SeedWorkspaceConfiguration;
}

describe("validateFixtureOutputFolders", () => {
    it("allows a single configuration writing to the fixture root", () => {
        const errors = validateFixtureOutputFolders({
            workspaceName: "go-sdk",
            workspaceConfig: workspaceConfig({ streaming: [{ outputFolder: "." }] })
        });
        expect(errors).toEqual([]);
    });

    it("allows multiple configurations in distinct output folders", () => {
        const errors = validateFixtureOutputFolders({
            workspaceName: "go-sdk",
            workspaceConfig: workspaceConfig({
                "idempotency-headers": [
                    { outputFolder: "no-custom-config" },
                    { outputFolder: "auto-generate-idempotency-key" }
                ]
            })
        });
        expect(errors).toEqual([]);
    });

    it("rejects a configuration writing to the fixture root alongside a nested configuration", () => {
        const errors = validateFixtureOutputFolders({
            workspaceName: "go-sdk",
            workspaceConfig: workspaceConfig({
                "idempotency-headers": [{ outputFolder: "." }, { outputFolder: "auto-generate-idempotency-key" }]
            })
        });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('fixture "idempotency-headers"');
        expect(errors[0]).toContain('"auto-generate-idempotency-key"');
    });
});
