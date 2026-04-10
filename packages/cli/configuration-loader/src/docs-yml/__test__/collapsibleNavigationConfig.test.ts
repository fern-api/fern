import { docsYml } from "@fern-api/configuration";
import { validateAgainstJsonSchema } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext, FernCliError } from "@fern-api/task-context";
import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

// Load the JSON schema at runtime to avoid cross-package boundary imports
const DocsYmlJsonSchema = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../../../workspace/loader/src/docs-yml.schema.json"), "utf-8")
);

describe("docs.yml navigation collapsible config", () => {
    it("should throw if collapsed-by-default is set without collapsible: true", async () => {
        const context = createMockTaskContext();

        const rawDocsConfiguration: docsYml.RawSchemas.DocsConfiguration = {
            instances: [],
            title: "Test",
            navigation: [
                {
                    section: "Section",
                    contents: [],
                    collapsedByDefault: true
                }
            ]
        };

        await expect(
            parseDocsConfiguration({
                rawDocsConfiguration,
                // These paths shouldn't be used by this test case.
                absolutePathToFernFolder: AbsoluteFilePath.of("/tmp"),
                absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/tmp/docs.yml"),
                context
            })
        ).rejects.toBeInstanceOf(FernCliError);
    });

    it("should throw if collapsible is used alongside deprecated collapsed", async () => {
        const context = createMockTaskContext();

        const rawDocsConfiguration: docsYml.RawSchemas.DocsConfiguration = {
            instances: [],
            title: "Test",
            navigation: [
                {
                    section: "Section",
                    contents: [],
                    collapsible: true,
                    collapsed: true
                }
            ]
        };

        await expect(
            parseDocsConfiguration({
                rawDocsConfiguration,
                absolutePathToFernFolder: AbsoluteFilePath.of("/tmp"),
                absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/tmp/docs.yml"),
                context
            })
        ).rejects.toBeInstanceOf(FernCliError);
    });

    it("should throw if collapsible is used alongside deprecated collapsed: open-by-default", async () => {
        const context = createMockTaskContext();

        const rawDocsConfiguration: docsYml.RawSchemas.DocsConfiguration = {
            instances: [],
            title: "Test",
            navigation: [
                {
                    section: "Section",
                    contents: [],
                    collapsible: true,
                    collapsed: "open-by-default"
                }
            ]
        };

        await expect(
            parseDocsConfiguration({
                rawDocsConfiguration,
                absolutePathToFernFolder: AbsoluteFilePath.of("/tmp"),
                absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/tmp/docs.yml"),
                context
            })
        ).rejects.toBeInstanceOf(FernCliError);
    });

    it("should accept open-by-default as a collapsed value on sections", async () => {
        const context = createMockTaskContext();

        const rawDocsConfiguration: docsYml.RawSchemas.DocsConfiguration = {
            instances: [],
            title: "Test",
            navigation: [
                {
                    section: "Section",
                    contents: [],
                    collapsed: "open-by-default"
                }
            ]
        };

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration,
            absolutePathToFernFolder: AbsoluteFilePath.of("/tmp"),
            absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/tmp/docs.yml"),
            context
        });

        expect(parsed.navigation).toMatchObject({
            type: "untabbed",
            items: [
                {
                    type: "section",
                    title: "Section",
                    collapsed: "open-by-default"
                }
            ]
        });
    });

    it("should accept collapsed: true on sections", async () => {
        const context = createMockTaskContext();

        const rawDocsConfiguration: docsYml.RawSchemas.DocsConfiguration = {
            instances: [],
            title: "Test",
            navigation: [
                {
                    section: "Section",
                    contents: [],
                    collapsed: true
                }
            ]
        };

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration,
            absolutePathToFernFolder: AbsoluteFilePath.of("/tmp"),
            absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/tmp/docs.yml"),
            context
        });

        expect(parsed.navigation).toMatchObject({
            type: "untabbed",
            items: [
                {
                    type: "section",
                    title: "Section",
                    collapsed: true
                }
            ]
        });
    });

    it("should pass through collapsible + collapsedByDefault on sections", async () => {
        const context = createMockTaskContext();

        const rawDocsConfiguration: docsYml.RawSchemas.DocsConfiguration = {
            instances: [],
            title: "Test",
            navigation: [
                {
                    section: "Section",
                    contents: [],
                    collapsible: true,
                    collapsedByDefault: true
                }
            ]
        };

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration,
            absolutePathToFernFolder: AbsoluteFilePath.of("/tmp"),
            absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/tmp/docs.yml"),
            context
        });

        expect(parsed.navigation).toMatchObject({
            type: "untabbed",
            items: [
                {
                    type: "section",
                    title: "Section",
                    collapsible: true,
                    collapsedByDefault: true
                }
            ]
        });
    });

    it("should accept a Context7 file that contains valid JSON", async () => {
        const context = createMockTaskContext();
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fern-context7-valid-"));
        const docsConfigPath = path.join(tempDir, "docs.yml");
        const context7Path = path.join(tempDir, "context7.json");
        fs.writeFileSync(context7Path, '{"public_key":"pk_test"}');

        const rawDocsConfiguration: docsYml.RawSchemas.DocsConfiguration = {
            instances: [],
            title: "Test",
            navigation: [],
            integrations: {
                context7: "./context7.json"
            }
        };

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration,
            absolutePathToFernFolder: AbsoluteFilePath.of(tempDir),
            absoluteFilepathToDocsConfig: AbsoluteFilePath.of(docsConfigPath),
            context
        });

        expect(parsed.context7File).toBe(AbsoluteFilePath.of(context7Path));
    });

    it("should reject a Context7 file with invalid JSON", async () => {
        const context = createMockTaskContext();
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fern-context7-invalid-"));
        const docsConfigPath = path.join(tempDir, "docs.yml");
        const context7Path = path.join(tempDir, "context7.json");
        fs.writeFileSync(context7Path, "{not-valid-json}");

        const rawDocsConfiguration: docsYml.RawSchemas.DocsConfiguration = {
            instances: [],
            title: "Test",
            navigation: [],
            integrations: {
                context7: "./context7.json"
            }
        };

        await expect(
            parseDocsConfiguration({
                rawDocsConfiguration,
                absolutePathToFernFolder: AbsoluteFilePath.of(tempDir),
                absoluteFilepathToDocsConfig: AbsoluteFilePath.of(docsConfigPath),
                context
            })
        ).rejects.toBeInstanceOf(FernCliError);
    });
});

describe("JSON schema validation for collapsed in API reference sections", () => {
    it("should pass JSON schema validation for collapsed: open-by-default in an API reference section layout", () => {
        const docsConfig = {
            instances: [{ url: "https://example.docs.buildwithfern.com" }],
            title: "Test",
            navigation: [
                {
                    api: "plants",
                    layout: [
                        {
                            section: "Common Models",
                            collapsed: "open-by-default",
                            contents: []
                        }
                    ]
                }
            ]
        };

        // biome-ignore lint/suspicious/noExplicitAny: needed for JSON schema type
        const result = validateAgainstJsonSchema(docsConfig, DocsYmlJsonSchema as any);
        expect(result.success).toBe(true);
    });

    it("should pass JSON schema validation for collapsed: true in an API reference section layout", () => {
        const docsConfig = {
            instances: [{ url: "https://example.docs.buildwithfern.com" }],
            title: "Test",
            navigation: [
                {
                    api: "plants",
                    layout: [
                        {
                            section: "Common Models",
                            collapsed: true,
                            contents: []
                        }
                    ]
                }
            ]
        };

        // biome-ignore lint/suspicious/noExplicitAny: needed for JSON schema type
        const result = validateAgainstJsonSchema(docsConfig, DocsYmlJsonSchema as any);
        expect(result.success).toBe(true);
    });

    it("should pass JSON schema validation for collapsed: open-by-default on top-level sections", () => {
        const docsConfig = {
            instances: [{ url: "https://example.docs.buildwithfern.com" }],
            title: "Test",
            navigation: [
                {
                    section: "Plants Guide",
                    collapsed: "open-by-default",
                    contents: [
                        {
                            page: "Overview",
                            path: "pages/overview.mdx"
                        }
                    ]
                }
            ]
        };

        // biome-ignore lint/suspicious/noExplicitAny: needed for JSON schema type
        const result = validateAgainstJsonSchema(docsConfig, DocsYmlJsonSchema as any);
        expect(result.success).toBe(true);
    });

    it("should pass JSON schema validation for collapsed: open-by-default on API reference configuration", () => {
        const docsConfig = {
            instances: [{ url: "https://example.docs.buildwithfern.com" }],
            title: "Test",
            navigation: [
                {
                    api: "plants",
                    collapsed: "open-by-default"
                }
            ]
        };

        // biome-ignore lint/suspicious/noExplicitAny: needed for JSON schema type
        const result = validateAgainstJsonSchema(docsConfig, DocsYmlJsonSchema as any);
        expect(result.success).toBe(true);
    });

    it("should reject invalid collapsed value in JSON schema validation", () => {
        const docsConfig = {
            instances: [{ url: "https://example.docs.buildwithfern.com" }],
            title: "Test",
            navigation: [
                {
                    api: "plants",
                    layout: [
                        {
                            section: "Common Models",
                            collapsed: "invalid-value",
                            contents: []
                        }
                    ]
                }
            ]
        };

        // biome-ignore lint/suspicious/noExplicitAny: needed for JSON schema type
        const result = validateAgainstJsonSchema(docsConfig, DocsYmlJsonSchema as any);
        expect(result.success).toBe(false);
    });
});
