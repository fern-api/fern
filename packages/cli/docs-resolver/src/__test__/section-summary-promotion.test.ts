import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";

import { ApiReferenceNodeConverter } from "../ApiReferenceNodeConverter.js";
import { NodeIdGenerator } from "../NodeIdGenerator.js";
import { convertIrToApiDefinition } from "../utils/convertIrToApiDefinition.js";

const context = createMockTaskContext();

const FIXTURE_DIR = resolve(AbsoluteFilePath.of(__dirname), "fixtures/section-summary-promotion/fern");

describe("section-summary-promotion", () => {
    it("does not promote section summary to API landing page", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: FIXTURE_DIR,
            context
        });

        if (docsWorkspace == null) {
            throw new Error("Workspace is null");
        }

        const parsedDocsConfig = await parseDocsConfiguration({
            rawDocsConfiguration: docsWorkspace.config,
            context,
            absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
            absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig
        });

        if (parsedDocsConfig.navigation.type !== "untabbed") {
            throw new Error("Expected untabbed navigation");
        }

        if (parsedDocsConfig.navigation.items[0]?.type !== "apiSection") {
            throw new Error("Expected apiSection");
        }

        const apiSection = parsedDocsConfig.navigation.items[0];

        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: FIXTURE_DIR,
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });

        if (!result.didSucceed) {
            throw new Error("API workspace failed to load");
        }

        const apiWorkspace = await result.workspace.toFernWorkspace({ context });
        const slug = FernNavigation.V1.SlugGenerator.init("/docs");

        const ir = generateIntermediateRepresentation({
            workspace: apiWorkspace,
            audiences: { type: "all" },
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false,
            exampleGeneration: { disabled: false },
            readme: undefined,
            version: undefined,
            packageName: undefined,
            context,
            sourceResolver: new SourceResolverImpl(context, apiWorkspace)
        });

        const apiDefinition = convertIrToApiDefinition({
            ir,
            apiDefinitionId: "test-api-id",
            context
        });

        const converter = new ApiReferenceNodeConverter(
            apiSection,
            apiDefinition,
            slug,
            docsWorkspace,
            context,
            new Map(),
            new Map(),
            new Map(),
            NodeIdGenerator.init(),
            new Map(),
            apiWorkspace
        );

        const node = converter.get();

        // The API reference node should NOT have an overviewPageId when only
        // a section summary exists (not an explicit API-level overview).
        // Previously, the section's summary was incorrectly promoted.
        expect(node.overviewPageId).toBeUndefined();

        // Verify the section child still has its own overviewPageId
        const sectionChild = node.children.find(
            (child): child is FernNavigation.V1.ApiPackageNode =>
                child.type === "apiPackage" && child.title === "Legacy APIs"
        );
        expect(sectionChild).toBeDefined();
        expect(sectionChild?.overviewPageId).toBeDefined();
    });
});
