import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { type GraphQLSpec, type OpenAPISpec, type Spec } from "@fern-api/api-workspace-commons";
import { docsYml, parseDocsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { type DocsWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";
import { afterEach, describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../../DocsDefinitionResolver.js";
import { createInlineSpecOssWorkspaces } from "../createInlineSpecOssWorkspaces.js";

/**
 * Two code paths turn the same docs.yml `api` + `specs` into an OSSWorkspace:
 *
 *   A. DocsDefinitionResolver.createDirectApiWorkspace  (`fern generate --docs`, `fern docs dev`; input is the
 *      PARSED navigation item with pre-resolved absolute paths)
 *   B. createInlineSpecOssWorkspaces                    (`fern check`; input is the RAW navigation with relative paths)
 *
 * This file pins every difference between them, so a future shared converter knows exactly what it must preserve
 * (or consciously change). Single-spec behavior of A is covered end to end in __test__/direct-api-spec.test.ts.
 */
function asFileSpec(spec: Spec): OpenAPISpec | GraphQLSpec {
    if (spec.type === "openapi" || spec.type === "graphql") {
        return spec;
    }
    throw new Error(`Unexpected spec type ${spec.type}`);
}

function openApiSpecsOf(workspace: OSSWorkspace): OpenAPISpec[] {
    return workspace.specs.filter((spec): spec is OpenAPISpec => spec.type === "openapi");
}

describe("direct API workspace creation: DocsDefinitionResolver vs createInlineSpecOssWorkspaces", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    });

    interface Loaded {
        fernDirectory: string;
        docsWorkspace: DocsWorkspace;
        apiSection: docsYml.DocsNavigationItem.ApiSection;
        resolver: DocsDefinitionResolver;
    }

    async function load(apiSectionYaml: string[], cliVersion: string | undefined): Promise<Loaded> {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-inline-spec-diff-"));
        temporaryDirectories.push(directory);
        const fernDirectory = path.join(directory, "fern");
        await mkdir(fernDirectory);
        await writeFile(
            path.join(fernDirectory, "docs.yml"),
            ["instances: []", "navigation:", ...apiSectionYaml, ""].join("\n")
        );
        const context = createMockTaskContext();
        const docsWorkspace = await loadDocsWorkspace({ fernDirectory: AbsoluteFilePath.of(fernDirectory), context });
        if (docsWorkspace == null) {
            throw new Error("Expected docs workspace");
        }
        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: docsWorkspace.config,
            absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
            absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig,
            context
        });
        if (parsed.navigation.type !== "untabbed") {
            throw new Error("Expected untabbed navigation");
        }
        const apiSection = parsed.navigation.items.find(
            (item): item is docsYml.DocsNavigationItem.ApiSection => item.type === "apiSection"
        );
        if (apiSection == null) {
            throw new Error("Expected an api section");
        }
        const resolver = new DocsDefinitionResolver({
            domain: "docs.example.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: async () => [],
            cliVersion
        });
        return { fernDirectory, docsWorkspace, apiSection, resolver };
    }

    function createInline(docsWorkspace: DocsWorkspace, cliVersion: string): OSSWorkspace[] {
        return createInlineSpecOssWorkspaces({
            navigation: docsWorkspace.config.navigation,
            absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig,
            absoluteFilePathToFernDirectory: docsWorkspace.absoluteFilePath,
            cliVersion
        });
    }

    interface Converted {
        fernDirectory: string;
        resolverWorkspace: OSSWorkspace | undefined;
        inlineWorkspace: OSSWorkspace;
    }

    async function convert(apiSectionYaml: string[], { cliVersion }: { cliVersion?: string } = {}): Promise<Converted> {
        const { fernDirectory, docsWorkspace, apiSection, resolver } = await load(apiSectionYaml, cliVersion);
        // A: `createDirectApiWorkspace` is private; bracket access is the only way to observe the OSSWorkspace it
        // builds. It is driven with the parsed navigation item.
        const resolverWorkspace = await resolver["createDirectApiWorkspace"](apiSection);
        // B: the `fern check` fallback, driven with the raw navigation.
        const [inlineWorkspace] = createInline(docsWorkspace, cliVersion ?? "check-cli-version");
        if (inlineWorkspace == null) {
            throw new Error("Expected an inline-spec workspace");
        }
        return { fernDirectory, resolverWorkspace, inlineWorkspace };
    }

    function requireWorkspace(workspace: OSSWorkspace | undefined): OSSWorkspace {
        if (workspace == null) {
            throw new Error("Expected the resolver to create a workspace");
        }
        return workspace;
    }

    it("agrees on file paths, namespace, source, overrides, overlays, workspace name and spec partitioning", async () => {
        const { fernDirectory, resolverWorkspace, inlineWorkspace } = await convert([
            "  - api: API reference",
            "    api-name: payments",
            "    specs:",
            "      - type: openapi",
            "        path: ../specs/openapi.yml",
            "        namespace: billing",
            "        overrides:",
            "          - ../specs/overrides.yml",
            "          - local-overrides.yml",
            "        overlays: ../specs/overlay.yml",
            "      - type: asyncapi",
            "        path: ../specs/asyncapi.yml",
            "        namespace: events",
            "      - type: graphql",
            "        path: ../specs/schema.graphql",
            "        namespace: gql"
        ]);
        const resolved = requireWorkspace(resolverWorkspace);
        const specsDirectory = path.join(path.dirname(fernDirectory), "specs");

        for (const workspace of [resolved, inlineWorkspace]) {
            expect(workspace.workspaceName).toBe("payments");
            expect(workspace.absoluteFilePath).toBe(fernDirectory);
            expect(workspace.generatorsConfiguration).toBeUndefined();
            expect(workspace.changelog).toBeUndefined();
            expect(openApiSpecsOf(workspace).map((spec) => spec.source.type)).toEqual(["openapi", "asyncapi"]);
            expect(workspace.allSpecs.map((spec) => [spec.type, asFileSpec(spec).namespace])).toEqual([
                ["openapi", "billing"],
                ["openapi", "events"],
                ["graphql", "gql"]
            ]);
            expect(workspace.allSpecs.map((spec) => asFileSpec(spec).absoluteFilepath)).toEqual([
                path.join(specsDirectory, "openapi.yml"),
                path.join(specsDirectory, "asyncapi.yml"),
                path.join(specsDirectory, "schema.graphql")
            ]);
            expect(workspace.allSpecs[0]).toMatchObject({
                absoluteFilepathToOverrides: [
                    path.join(specsDirectory, "overrides.yml"),
                    `${fernDirectory}/local-overrides.yml`
                ],
                absoluteFilepathToOverlays: path.join(specsDirectory, "overlay.yml")
            });
        }
    });

    it("difference: only the resolver maps `settings`; the inline converter never sets `settings`", async () => {
        const { resolverWorkspace, inlineWorkspace } = await convert([
            "  - api: API reference",
            "    specs:",
            "      - type: openapi",
            "        path: ../specs/openapi.yml",
            "        settings:",
            "          type-dates-as-strings: false",
            "          use-bytes-for-binary-response: true",
            "      - type: asyncapi",
            "        path: ../specs/asyncapi.yml",
            "        settings:",
            "          type-dates-as-strings: false",
            "      - type: graphql",
            "        path: ../specs/schema.graphql"
        ]);
        const resolved = requireWorkspace(resolverWorkspace);

        const [resolvedOpenApi, resolvedAsyncApi, resolvedGraphql] = resolved.allSpecs;
        expect(resolvedOpenApi).toHaveProperty("settings");
        expect(resolvedOpenApi).toMatchObject({
            settings: { typeDatesAsStrings: false, useBytesForBinaryResponse: true }
        });
        expect(resolvedAsyncApi).toMatchObject({ settings: { typeDatesAsStrings: false } });
        expect(resolvedGraphql).not.toHaveProperty("settings");

        for (const spec of inlineWorkspace.allSpecs) {
            expect(spec).not.toHaveProperty("settings");
        }
        // The workspace-level flags OSSWorkspace derives from per-spec settings differ as a consequence.
        expect(resolved.useBytesForBinaryResponse).toBe(true);
        expect(inlineWorkspace.useBytesForBinaryResponse).toBeUndefined();
    });

    it("difference: the resolver always sets `settings` on openapi specs, even when docs.yml has none", async () => {
        const { resolverWorkspace, inlineWorkspace } = await convert([
            "  - api: API reference",
            "    specs:",
            "      - type: openapi",
            "        path: ../specs/openapi.yml"
        ]);
        const resolvedSpec = requireWorkspace(resolverWorkspace).allSpecs[0];
        expect(resolvedSpec).toHaveProperty("settings");
        expect(resolvedSpec).toMatchObject({
            settings: { typeDatesAsStrings: false, useBytesForBinaryResponse: false }
        });
        expect(inlineWorkspace.allSpecs[0]).not.toHaveProperty("settings");
    });

    it("difference: resolver defaults absent overrides to [], the inline converter leaves them undefined", async () => {
        const { resolverWorkspace, inlineWorkspace } = await convert([
            "  - api: API reference",
            "    specs:",
            "      - type: openapi",
            "        path: ../specs/openapi.yml",
            "      - type: graphql",
            "        path: ../specs/schema.graphql"
        ]);
        const resolved = requireWorkspace(resolverWorkspace);
        expect(resolved.allSpecs.map((spec) => spec.absoluteFilepathToOverrides)).toEqual([[], []]);
        expect(inlineWorkspace.allSpecs.map((spec) => spec.absoluteFilepathToOverrides)).toEqual([
            undefined,
            undefined
        ]);
        expect(openApiSpecsOf(resolved).map((spec) => spec.absoluteFilepathToOverlays)).toEqual([undefined]);
    });

    it("difference: the resolver resolves error-responses schema file paths via the docs parser; inline ignores them", async () => {
        const { resolverWorkspace, inlineWorkspace } = await convert([
            "  - api: API reference",
            "    specs:",
            "      - type: openapi",
            "        path: ../specs/openapi.yml",
            "        settings:",
            "          error-responses:",
            "            schema: ../specs/error.yml",
            "            name: ApiError",
            "            apply-to: untyped"
        ]);
        expect(requireWorkspace(resolverWorkspace).allSpecs[0]).toMatchObject({
            settings: {
                errorResponses: { schema: expect.stringMatching(/specs\/error\.yml$/), name: "ApiError" }
            }
        });
        expect(inlineWorkspace.allSpecs[0]).not.toHaveProperty("settings");
    });

    it('difference: cliVersion falls back to "unknown" in the resolver and is required by the inline converter', async () => {
        const withoutVersion = await convert([
            "  - api: API reference",
            "    specs:",
            "      - type: openapi",
            "        path: ../specs/openapi.yml"
        ]);
        expect(requireWorkspace(withoutVersion.resolverWorkspace).cliVersion).toBe("unknown");
        expect(withoutVersion.inlineWorkspace.cliVersion).toBe("check-cli-version");

        const withVersion = await convert(
            ["  - api: API reference", "    specs:", "      - type: openapi", "        path: ../specs/openapi.yml"],
            { cliVersion: "4.5.6" }
        );
        expect(requireWorkspace(withVersion.resolverWorkspace).cliVersion).toBe("4.5.6");
        expect(withVersion.inlineWorkspace.cliVersion).toBe("4.5.6");
    });

    it("difference: a section with `specs: []` yields no workspace in either path", async () => {
        const { docsWorkspace, apiSection, resolver } = await load(
            ["  - api: API reference", "    specs: []"],
            undefined
        );
        expect(apiSection.specs).toEqual([]);
        expect(await resolver["createDirectApiWorkspace"](apiSection)).toBeUndefined();
        expect(createInline(docsWorkspace, "0.0.0")).toEqual([]);
    });
});
