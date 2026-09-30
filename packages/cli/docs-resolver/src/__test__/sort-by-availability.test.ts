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
import { sortChildrenByAvailability } from "../utils/sortChildrenByAvailability.js";

const context = createMockTaskContext();

const FIXTURE_DIR = resolve(AbsoluteFilePath.of(__dirname), "fixtures/sort-by-availability/fern");

function getTitle(child: FernNavigation.V1.ApiPackageChild): string {
    return child.type === "endpointPair" ? child.nonStream.title : child.title;
}

function endpoint(
    title: string,
    availability: FernNavigation.V1.NavigationV1Availability | undefined
): FernNavigation.V1.ApiPackageChild {
    return {
        id: FernNavigation.V1.NodeId(title),
        type: "endpoint",
        collapsed: undefined,
        method: "GET",
        endpointId: FernNavigation.V1.EndpointId(title),
        apiDefinitionId: FernNavigation.V1.ApiDefinitionId("api"),
        availability,
        isResponseStream: undefined,
        title,
        slug: FernNavigation.V1.Slug(title),
        icon: undefined,
        hidden: undefined,
        playground: undefined,
        authed: undefined,
        viewers: undefined,
        orphaned: undefined,
        featureFlags: undefined
    };
}

describe("sortChildrenByAvailability", () => {
    const children = [
        endpoint("deprecated", "deprecated"),
        endpoint("legacy", "legacy"),
        endpoint("preview", "preview"),
        endpoint("beta", "beta"),
        endpoint("alpha", "alpha"),
        endpoint("ga", "generally-available"),
        endpoint("none", undefined)
    ];

    it("puts listed availabilities first, then the rest in default order", () => {
        expect(sortChildrenByAvailability(children, ["beta", "deprecated"]).map(getTitle)).toEqual([
            "beta",
            "deprecated",
            "none",
            "ga",
            "alpha",
            "preview",
            "legacy"
        ]);
    });

    it("uses the given order when every availability is listed", () => {
        expect(
            sortChildrenByAvailability(children, [
                "deprecated",
                "legacy",
                "preview",
                "beta",
                "alpha",
                "generally-available"
            ]).map(getTitle)
        ).toEqual(["deprecated", "legacy", "preview", "beta", "alpha", "ga", "none"]);
    });

    it("treats stable as generally-available and in-development/pre-release as beta", () => {
        const aliased = [
            endpoint("pre-release", "pre-release"),
            endpoint("stable", "stable"),
            endpoint("in-development", "in-development"),
            endpoint("ga", "generally-available"),
            endpoint("none", undefined)
        ];
        expect(sortChildrenByAvailability(aliased, ["stable", "beta"]).map(getTitle)).toEqual([
            "stable",
            "ga",
            "pre-release",
            "in-development",
            "none"
        ]);
    });

    it("keeps the existing order within the same availability", () => {
        const sameAvailability = [endpoint("b", "beta"), endpoint("a", "beta"), endpoint("c", undefined)];
        expect(sortChildrenByAvailability(sameAvailability, ["beta"]).map(getTitle)).toEqual(["b", "a", "c"]);
    });
});

describe("sort-by-availability", () => {
    it("sorts endpoints within a tag by availability, alphabetically within each availability", async () => {
        const docsWorkspace = await loadDocsWorkspace({ fernDirectory: FIXTURE_DIR, context });
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
        const apiSection = parsedDocsConfig.navigation.items[0];
        if (apiSection?.type !== "apiSection") {
            throw new Error("Expected apiSection");
        }
        expect(apiSection.sortByAvailability).toEqual(["beta", "deprecated"]);

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
        const apiDefinition = convertIrToApiDefinition({ ir, apiDefinitionId: "sort-by-availability", context });

        const node = new ApiReferenceNodeConverter(
            apiSection,
            apiDefinition,
            FernNavigation.V1.SlugGenerator.init("/docs"),
            docsWorkspace,
            context,
            new Map(),
            new Map(),
            new Map(),
            NodeIdGenerator.init(),
            new Map(),
            apiWorkspace
        ).get();

        const plants = node.children.find((child) => child.type === "apiPackage");
        expect.assert(plants?.type === "apiPackage");
        expect(plants.children.map(getTitle)).toEqual([
            "Graft plant",
            "Repot plant",
            "Compost plant",
            "Water plant",
            "Harvest plant",
            "List plants",
            "Create plant",
            "Prune plant",
            "Mist plant",
            "Fertilize plant"
        ]);
    });
});
