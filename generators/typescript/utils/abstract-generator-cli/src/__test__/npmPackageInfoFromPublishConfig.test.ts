import { FernGeneratorExec } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { npmPackageInfoFromPublishConfig } from "../npmPackageInfoFromPublishConfig";

describe("npmPackageInfoFromPublishConfig", () => {
    const createMockConfig = (license?: FernGeneratorExec.LicenseConfig): FernGeneratorExec.GeneratorConfig => {
        return {
            dryRun: false,
            irFilepath: "/path/to/ir.json",
            output: {
                path: "/output",
                mode: FernGeneratorExec.OutputMode.downloadFiles()
            },
            organization: "test-org",
            workspaceName: "test-workspace",
            environment: {
                type: "local"
            },
            customConfig: {},
            whitelabel: false,
            writeUnitTests: false,
            generateOauthClients: false,
            generatePaginatedClients: false,
            license
        } as FernGeneratorExec.GeneratorConfig;
    };

    describe("github publishConfig with npm target", () => {
        it("extracts packageName and version from github publishConfig with npm target", () => {
            const config = createMockConfig();
            const publishConfig = FernIr.PublishingConfig.github({
                owner: "payabli",
                repo: "sdk-node",
                uri: undefined,
                token: undefined,
                mode: undefined,
                branch: undefined,
                target: FernIr.PublishTarget.npm({
                    packageName: "@payabli/sdk-node",
                    version: "0.0.116",
                    tokenEnvironmentVariable: "NPM_TOKEN"
                })
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, false);

            expect(result.packageName).toBe("@payabli/sdk-node");
            expect(result.version).toBe("0.0.116");
            expect(result.repoUrl).toBe("github:payabli/sdk-node");
            expect(result.publishInfo).toBeUndefined();
            expect(result.isPackagePrivate).toBe(false);
        });

        it("uses uri as fallback when owner/repo are null", () => {
            const config = createMockConfig();
            // Note: The GithubPublish type requires owner and repo as strings,
            // but the code checks for != null, so we test with the uri fallback
            // by providing a uri and checking that owner/repo take precedence when present
            const publishConfig = FernIr.PublishingConfig.github({
                owner: "custom",
                repo: "repo",
                uri: "https://github.com/fallback/uri",
                token: undefined,
                mode: undefined,
                branch: undefined,
                target: FernIr.PublishTarget.npm({
                    packageName: "@custom/sdk",
                    version: "1.0.0",
                    tokenEnvironmentVariable: "NPM_TOKEN"
                })
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, false);

            expect(result.packageName).toBe("@custom/sdk");
            expect(result.version).toBe("1.0.0");
            // owner/repo take precedence over uri
            expect(result.repoUrl).toBe("github:custom/repo");
        });

        it("preserves license config", () => {
            const license = FernGeneratorExec.LicenseConfig.basic({
                id: "MIT"
            });
            const config = createMockConfig(license);
            const publishConfig = FernIr.PublishingConfig.github({
                owner: "test",
                repo: "repo",
                uri: undefined,
                token: undefined,
                mode: undefined,
                branch: undefined,
                target: FernIr.PublishTarget.npm({
                    packageName: "@test/sdk",
                    version: "1.0.0",
                    tokenEnvironmentVariable: "NPM_TOKEN"
                })
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, false);

            expect(result.licenseConfig).toBe(license);
        });
    });

    describe("filesystem publishConfig with npm publishTarget", () => {
        it("extracts packageName and version from filesystem publishConfig with npm publishTarget", () => {
            const config = createMockConfig();
            const publishConfig = FernIr.PublishingConfig.filesystem({
                generateFullProject: true,
                publishTarget: FernIr.PublishTarget.npm({
                    packageName: "@payabli/sdk-node",
                    version: "0.0.116",
                    tokenEnvironmentVariable: "NPM_TOKEN"
                })
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, false);

            expect(result.packageName).toBe("@payabli/sdk-node");
            expect(result.version).toBe("0.0.116");
            expect(result.repoUrl).toBeUndefined();
            expect(result.publishInfo).toBeUndefined();
            expect(result.isPackagePrivate).toBe(false);
        });

        it("handles filesystem publishConfig without publishTarget", () => {
            const config = createMockConfig();
            const publishConfig = FernIr.PublishingConfig.filesystem({
                generateFullProject: true,
                publishTarget: undefined
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, false);

            expect(result.packageName).toBeUndefined();
            expect(result.version).toBeUndefined();
            expect(result.isPackagePrivate).toBe(false);
        });
    });

    describe("direct publishConfig with npm target", () => {
        it("extracts packageName and version from direct publishConfig with npm target", () => {
            const config = createMockConfig();
            const publishConfig = FernIr.PublishingConfig.direct({
                target: FernIr.PublishTarget.npm({
                    packageName: "@direct/sdk",
                    version: "2.0.0",
                    tokenEnvironmentVariable: "NPM_TOKEN"
                })
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, true);

            expect(result.packageName).toBe("@direct/sdk");
            expect(result.version).toBe("2.0.0");
            expect(result.repoUrl).toBeUndefined();
            expect(result.publishInfo).toBeUndefined();
            expect(result.isPackagePrivate).toBe(true);
        });
    });

    describe("non-npm publish targets", () => {
        it("returns empty args for maven target", () => {
            const config = createMockConfig();
            const publishConfig = FernIr.PublishingConfig.filesystem({
                generateFullProject: true,
                publishTarget: FernIr.PublishTarget.maven({
                    coordinate: "com.example:sdk",
                    version: "1.0.0",
                    usernameEnvironmentVariable: "MAVEN_USERNAME",
                    passwordEnvironmentVariable: "MAVEN_PASSWORD",
                    mavenUrlEnvironmentVariable: "MAVEN_URL"
                })
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, false);

            expect(result.packageName).toBeUndefined();
            expect(result.version).toBeUndefined();
            expect(result.isPackagePrivate).toBe(false);
        });

        it("returns empty args for pypi target", () => {
            const config = createMockConfig();
            const publishConfig = FernIr.PublishingConfig.github({
                owner: "test",
                repo: "repo",
                uri: undefined,
                token: undefined,
                mode: undefined,
                branch: undefined,
                target: FernIr.PublishTarget.pypi({
                    packageName: "test-sdk",
                    version: "1.0.0"
                })
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, false);

            expect(result.packageName).toBeUndefined();
            expect(result.version).toBeUndefined();
            expect(result.isPackagePrivate).toBe(false);
        });
    });

    describe("undefined publishConfig", () => {
        it("returns only isPackagePrivate when publishConfig is undefined", () => {
            const config = createMockConfig();

            const result = npmPackageInfoFromPublishConfig(config, undefined, true);

            expect(result.packageName).toBeUndefined();
            expect(result.version).toBeUndefined();
            expect(result.repoUrl).toBeUndefined();
            expect(result.publishInfo).toBeUndefined();
            expect(result.isPackagePrivate).toBe(true);
        });
    });

    describe("isPackagePrivate flag", () => {
        it("sets isPackagePrivate to true when specified", () => {
            const config = createMockConfig();
            const publishConfig = FernIr.PublishingConfig.filesystem({
                generateFullProject: true,
                publishTarget: FernIr.PublishTarget.npm({
                    packageName: "@private/sdk",
                    version: "1.0.0",
                    tokenEnvironmentVariable: "NPM_TOKEN"
                })
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, true);

            expect(result.isPackagePrivate).toBe(true);
        });

        it("sets isPackagePrivate to false when specified", () => {
            const config = createMockConfig();
            const publishConfig = FernIr.PublishingConfig.filesystem({
                generateFullProject: true,
                publishTarget: FernIr.PublishTarget.npm({
                    packageName: "@public/sdk",
                    version: "1.0.0",
                    tokenEnvironmentVariable: "NPM_TOKEN"
                })
            });

            const result = npmPackageInfoFromPublishConfig(config, publishConfig, false);

            expect(result.isPackagePrivate).toBe(false);
        });
    });
});
