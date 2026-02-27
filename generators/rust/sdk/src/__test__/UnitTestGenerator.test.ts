import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { UnitTestGenerator } from "../unit-tests/UnitTestGenerator.js";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext.js";

describe("UnitTestGenerator", () => {
    describe("generateConfigTests", () => {
        it("should generate inline config test module", () => {
            const context = createSampleGeneratorContext();
            const generator = new UnitTestGenerator(context);
            const output = generator.generateConfigTests();

            expect(output).toContain("#[cfg(test)]");
            expect(output).toContain("mod tests {");
            expect(output).toContain("use super::*;");
            expect(output).toContain("fn test_default_config_has_sensible_defaults()");
            expect(output).toContain("fn test_custom_config_overrides()");
            expect(output).toContain("Duration::from_secs(60)");
            expect(output).toContain("assert_eq!(config.max_retries, 3)");
            expect(output).toContain('assert!(config.base_url.is_empty())');
            expect(output).toContain('"X-Fern-Language"');
        });

        it("should check non-empty base_url when default environment exists", () => {
            const context = createSampleGeneratorContext({
                environments: {
                    defaultEnvironment: "Production",
                    environments: {
                        type: "singleBaseUrl",
                        environments: [
                            {
                                id: "Production",
                                name: {
                                    originalName: "Production",
                                    camelCase: { unsafeName: "production", safeName: "production" },
                                    snakeCase: { unsafeName: "production", safeName: "production" },
                                    screamingSnakeCase: { unsafeName: "PRODUCTION", safeName: "PRODUCTION" },
                                    pascalCase: { unsafeName: "Production", safeName: "Production" }
                                },
                                url: "https://api.production.com",
                                docs: undefined
                            }
                        ]
                    } as unknown as FernIr.Environments
                }
            });
            const generator = new UnitTestGenerator(context);
            const output = generator.generateConfigTests();

            expect(output).toContain("assert!(!config.base_url.is_empty())");
            expect(output).not.toContain("assert!(config.base_url.is_empty())");
        });
    });

    describe("generateClientTests", () => {
        it("should generate inline client test module with correct client name", () => {
            const context = createSampleGeneratorContext();
            const generator = new UnitTestGenerator(context);
            const output = generator.generateClientTests();

            expect(output).toContain("#[cfg(test)]");
            expect(output).toContain("mod tests {");
            expect(output).toContain("use super::*;");
            expect(output).toContain("fn test_client_new_with_default_config()");
            expect(output).toContain("TestClient::new(config)");
            expect(output).toContain("assert!(client.is_ok()");
        });
    });

    describe("generateUnitTestFile", () => {
        it("should generate separate test file with correct crate and client references", () => {
            const context = createSampleGeneratorContext();
            const generator = new UnitTestGenerator(context);
            const file = generator.generateUnitTestFile();

            expect(file.filename).toBe("unit_test.rs");
            expect(file.directory).toBe("tests");

            const contents = file.fileContents;
            expect(contents).toContain("use test_api::config::ClientConfig;");
            expect(contents).toContain("use test_api::api::resources::TestClient;");
            expect(contents).toContain("fn test_client_creation_with_default_config()");
            expect(contents).toContain("fn test_client_creation_with_custom_config()");
            expect(contents).toContain("fn test_config_default_headers_contain_fern_metadata()");
            expect(contents).toContain("TestClient::new(config)");
            expect(contents).toContain('"X-Fern-SDK-Name"');
            expect(contents).toContain('"X-Fern-SDK-Version"');
        });
    });
});
