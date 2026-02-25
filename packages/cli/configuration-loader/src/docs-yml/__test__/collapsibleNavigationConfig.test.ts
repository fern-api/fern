import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext, FernCliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

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
});
