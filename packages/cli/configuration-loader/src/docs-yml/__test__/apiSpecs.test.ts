import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

describe("parseDocsConfiguration — direct API specs", () => {
    it("resolves spec, overlay, and override paths relative to docs.yml", async () => {
        const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
            instances: [],
            navigation: [
                {
                    api: "API reference",
                    "api-name": "payments",
                    specs: [
                        {
                            type: "openapi",
                            path: "../specs/openapi.yml",
                            namespace: "payments",
                            overlays: "../specs/overlay.yml",
                            overrides: ["../specs/override.yml"]
                        }
                    ]
                }
            ]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration,
            absolutePathToFernFolder: AbsoluteFilePath.of("/repo/fern"),
            absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/repo/fern/docs.yml"),
            context: createMockTaskContext()
        });

        if (parsed.navigation.type !== "untabbed" || parsed.navigation.items[0]?.type !== "apiSection") {
            throw new Error("Expected an API section");
        }
        expect(parsed.navigation.items[0].specs).toEqual([
            {
                type: "openapi",
                absolutePath: "/repo/specs/openapi.yml",
                namespace: "payments",
                absoluteOverlayPaths: ["/repo/specs/overlay.yml"],
                absoluteOverridePaths: ["/repo/specs/override.yml"]
            }
        ]);
    });

    it("keeps a legacy API section valid when direct specs are absent", async () => {
        const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
            instances: [],
            navigation: [{ api: "API reference", "api-name": "payments" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration,
            absolutePathToFernFolder: AbsoluteFilePath.of("/repo/fern"),
            absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/repo/fern/docs.yml"),
            context: createMockTaskContext()
        });

        if (parsed.navigation.type !== "untabbed" || parsed.navigation.items[0]?.type !== "apiSection") {
            throw new Error("Expected an API section");
        }
        expect(parsed.navigation.items[0].specs).toBeUndefined();
        expect(parsed.navigation.items[0].apiName).toBe("payments");
    });

    it("parses direct API specs nested inside a section", async () => {
        const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
            instances: [],
            navigation: [
                {
                    section: "APIs",
                    contents: [
                        {
                            api: "API reference",
                            "api-name": "payments",
                            specs: [{ type: "openapi", path: "../specs/openapi.yml" }]
                        }
                    ]
                }
            ]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration,
            absolutePathToFernFolder: AbsoluteFilePath.of("/repo/fern"),
            absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/repo/fern/docs.yml"),
            context: createMockTaskContext()
        });

        if (parsed.navigation.type !== "untabbed" || parsed.navigation.items[0]?.type !== "section") {
            throw new Error("Expected a navigation section");
        }
        const apiSection = parsed.navigation.items[0].contents[0];
        if (apiSection?.type !== "apiSection") {
            throw new Error("Expected a nested API section");
        }
        expect(apiSection.specs?.[0]?.absolutePath).toBe("/repo/specs/openapi.yml");
    });
});
