import { type Spec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { describe, expect, it } from "vitest";

import { createInlineSpecOssWorkspaces } from "../createInlineSpecOssWorkspaces.js";

const FERN_DIRECTORY = AbsoluteFilePath.of("/repo/fern");
const DOCS_CONFIG = AbsoluteFilePath.of("/repo/fern/docs.yml");
const CLI_VERSION = "1.2.3";

function create(navigation: unknown, cliVersion = CLI_VERSION): OSSWorkspace[] {
    return createInlineSpecOssWorkspaces({
        navigation,
        absoluteFilepathToDocsConfig: DOCS_CONFIG,
        absoluteFilePathToFernDirectory: FERN_DIRECTORY,
        cliVersion
    });
}

function single(navigation: unknown): OSSWorkspace {
    const workspaces = create(navigation);
    const [workspace] = workspaces;
    if (workspaces.length !== 1 || workspace == null) {
        throw new Error(`Expected exactly one workspace, got ${workspaces.length}`);
    }
    return workspace;
}

function filepathOf(spec: Spec): string {
    if (spec.type === "openapi" || spec.type === "graphql") {
        return spec.absoluteFilepath;
    }
    throw new Error(`Unexpected spec type ${spec.type}`);
}

function section(specs: unknown[], extra: Record<string, unknown> = {}): Record<string, unknown> {
    return { api: "API Reference", specs, ...extra };
}

describe("createInlineSpecOssWorkspaces", () => {
    describe("which workspaces are created", () => {
        it.each([
            ["undefined navigation", undefined],
            ["an empty navigation", []],
            ["navigation without api sections", [{ page: "Intro", path: "intro.mdx" }]],
            ["an api section without specs", [{ api: "A" }]],
            ["an api section with empty specs", [{ api: "A", specs: [] }]]
        ])("creates nothing for %s", (_name, navigation) => {
            expect(create(navigation)).toEqual([]);
        });

        it("creates one OSSWorkspace per api section with inline specs, in document order", () => {
            const workspaces = create([
                section([{ type: "openapi", path: "a.yml" }], { apiName: "first" }),
                { tab: "t", layout: [section([{ type: "openapi", path: "b.yml" }], { apiName: "second" })] },
                { api: "ignored", specs: [] },
                section([{ type: "asyncapi", path: "c.yml" }], { apiName: "third" })
            ]);
            expect(workspaces.every((workspace) => workspace instanceof OSSWorkspace)).toBe(true);
            expect(workspaces.map((workspace) => workspace.workspaceName)).toEqual(["first", "second", "third"]);
            expect(workspaces.map((workspace) => workspace.allSpecs.map(filepathOf))).toEqual([
                ["/repo/fern/a.yml"],
                ["/repo/fern/b.yml"],
                ["/repo/fern/c.yml"]
            ]);
        });

        it("creates distinct workspaces even for sections that share an apiName", () => {
            const workspaces = create([
                section([{ type: "openapi", path: "a.yml" }], { apiName: "same" }),
                section([{ type: "openapi", path: "b.yml" }], { apiName: "same" })
            ]);
            expect(workspaces).toHaveLength(2);
            expect(workspaces[0]).not.toBe(workspaces[1]);
            expect(workspaces.map((workspace) => workspace.workspaceName)).toEqual(["same", "same"]);
        });
    });

    describe("workspace-level fields", () => {
        it("maps apiName to workspaceName", () => {
            expect(single([section([{ type: "openapi", path: "a.yml" }], { apiName: "payments" })]).workspaceName).toBe(
                "payments"
            );
        });

        it("leaves workspaceName undefined when apiName is absent (the api title is not used)", () => {
            expect(single([section([{ type: "openapi", path: "a.yml" }])]).workspaceName).toBeUndefined();
        });

        it("leaves workspaceName undefined when apiName is null", () => {
            expect(single([section([{ type: "openapi", path: "a.yml" }], { apiName: null })]).workspaceName).toBe(
                undefined
            );
        });

        // navigation comes from the parsed (camelCase) docs config, so the kebab-case raw key is not recognized.
        it("ignores the raw kebab-case api-name key", () => {
            const workspace = single([section([{ type: "openapi", path: "a.yml" }], { "api-name": "raw" })]);
            expect(workspace.workspaceName).toBeUndefined();
        });

        it("passes the fern directory, cliVersion, and leaves generators configuration and changelog undefined", () => {
            const [workspace] = create([section([{ type: "openapi", path: "a.yml" }])], "9.9.9-rc.1");
            expect(workspace?.absoluteFilePath).toBe(FERN_DIRECTORY);
            expect(workspace?.cliVersion).toBe("9.9.9-rc.1");
            expect(workspace?.generatorsConfiguration).toBeUndefined();
            expect(workspace?.changelog).toBeUndefined();
            expect(workspace?.type).toBe("oss");
        });
    });

    describe("spec conversion", () => {
        it("converts an openapi spec", () => {
            const workspace = single([section([{ type: "openapi", path: "openapi/openapi.yml" }])]);
            const expected = {
                type: "openapi",
                absoluteFilepath: "/repo/fern/openapi/openapi.yml",
                absoluteFilepathToOverrides: undefined,
                absoluteFilepathToOverlays: undefined,
                source: { type: "openapi", file: "/repo/fern/openapi/openapi.yml" },
                namespace: undefined
            };
            expect(workspace.specs).toStrictEqual([expected]);
            expect(workspace.allSpecs).toStrictEqual([expected]);
        });

        it("converts an asyncapi spec into an openapi-typed spec whose source is asyncapi", () => {
            const workspace = single([section([{ type: "asyncapi", path: "asyncapi/asyncapi.yml" }])]);
            const expected = {
                type: "openapi",
                absoluteFilepath: "/repo/fern/asyncapi/asyncapi.yml",
                absoluteFilepathToOverrides: undefined,
                absoluteFilepathToOverlays: undefined,
                source: { type: "asyncapi", file: "/repo/fern/asyncapi/asyncapi.yml" },
                namespace: undefined
            };
            expect(workspace.specs).toStrictEqual([expected]);
            expect(workspace.allSpecs).toStrictEqual([expected]);
        });

        it("converts a graphql spec", () => {
            const workspace = single([section([{ type: "graphql", path: "schema.graphql" }])]);
            expect(workspace.allSpecs).toStrictEqual([
                {
                    type: "graphql",
                    absoluteFilepath: "/repo/fern/schema.graphql",
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToExamples: undefined,
                    namespace: undefined
                }
            ]);
        });

        it("excludes graphql specs from `specs` but keeps them in `allSpecs`, preserving order", () => {
            const workspace = single([
                section([
                    { type: "graphql", path: "one.graphql" },
                    { type: "openapi", path: "api.yml" },
                    { type: "asyncapi", path: "events.yml" },
                    { type: "graphql", path: "two.graphql" }
                ])
            ]);
            expect(workspace.allSpecs.map((spec) => [spec.type, filepathOf(spec)])).toEqual([
                ["graphql", "/repo/fern/one.graphql"],
                ["openapi", "/repo/fern/api.yml"],
                ["openapi", "/repo/fern/events.yml"],
                ["graphql", "/repo/fern/two.graphql"]
            ]);
            expect(workspace.specs.map(filepathOf)).toEqual(["/repo/fern/api.yml", "/repo/fern/events.yml"]);
            expect(workspace.specs.every((spec) => spec.type === "openapi")).toBe(true);
        });

        it("creates a workspace with empty `specs` when a section only has graphql specs", () => {
            const workspace = single([section([{ type: "graphql", path: "schema.graphql" }], { apiName: "gql" })]);
            expect(workspace.specs).toEqual([]);
            expect(workspace.allSpecs).toHaveLength(1);
            expect(workspace.workspaceName).toBe("gql");
        });

        it("shares the same spec objects between `specs` and `allSpecs`", () => {
            const workspace = single([section([{ type: "openapi", path: "a.yml" }])]);
            expect(workspace.specs[0]).toBe(workspace.allSpecs[0]);
        });

        it.each([
            ["openapi", "openapi"],
            ["asyncapi", "asyncapi"]
        ])("passes the namespace through for %s", (type, sourceType) => {
            const workspace = single([section([{ type, path: "a.yml", namespace: "billing" }])]);
            expect(workspace.allSpecs[0]).toMatchObject({ namespace: "billing", source: { type: sourceType } });
        });

        it("passes the namespace through for graphql", () => {
            const workspace = single([section([{ type: "graphql", path: "a.graphql", namespace: "billing" }])]);
            expect(workspace.allSpecs[0]).toMatchObject({ type: "graphql", namespace: "billing" });
        });

        it("resolves every path relative to the directory containing docs.yml", () => {
            const workspace = single([
                section([
                    {
                        type: "openapi",
                        path: "../specs/openapi.yml",
                        overrides: ["overrides/one.yml", "../shared/two.yml", "/abs/three.yml"],
                        overlays: "overlays/overlay.yml"
                    }
                ])
            ]);
            expect(workspace.allSpecs[0]).toMatchObject({
                absoluteFilepath: "/repo/specs/openapi.yml",
                absoluteFilepathToOverrides: ["/repo/fern/overrides/one.yml", "/repo/shared/two.yml", "/abs/three.yml"],
                absoluteFilepathToOverlays: "/repo/fern/overlays/overlay.yml",
                source: { type: "openapi", file: "/repo/specs/openapi.yml" }
            });
        });

        it("resolves against docs.yml's directory, not the fern directory passed separately", () => {
            const workspaces = createInlineSpecOssWorkspaces({
                navigation: [section([{ type: "openapi", path: "a.yml" }])],
                absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/elsewhere/docs/docs.yml"),
                absoluteFilePathToFernDirectory: FERN_DIRECTORY,
                cliVersion: CLI_VERSION
            });
            expect(workspaces[0]?.allSpecs.map(filepathOf)).toEqual(["/elsewhere/docs/a.yml"]);
            expect(workspaces[0]?.absoluteFilePath).toBe(FERN_DIRECTORY);
        });

        it("resolves overrides for asyncapi and graphql specs", () => {
            const workspace = single([
                section([
                    { type: "asyncapi", path: "events.yml", overrides: ["events-overrides.yml"] },
                    { type: "graphql", path: "schema.graphql", overrides: ["gql-overrides.yml"] }
                ])
            ]);
            expect(workspace.allSpecs.map((spec) => spec.absoluteFilepathToOverrides)).toEqual([
                ["/repo/fern/events-overrides.yml"],
                ["/repo/fern/gql-overrides.yml"]
            ]);
        });

        it("keeps an empty overrides list as an empty list", () => {
            const workspace = single([section([{ type: "openapi", path: "a.yml", overrides: [] }])]);
            expect(workspace.allSpecs[0]).toMatchObject({ absoluteFilepathToOverrides: [] });
        });

        it("ignores overlays on a graphql spec", () => {
            const workspace = single([section([{ type: "graphql", path: "a.graphql", overlays: "overlay.yml" }])]);
            expect(workspace.allSpecs[0]).not.toHaveProperty("absoluteFilepathToOverlays");
        });

        it("keeps a single overlays path as a single path (not a list)", () => {
            const workspace = single([section([{ type: "asyncapi", path: "a.yml", overlays: "o.yml" }])]);
            expect(workspace.allSpecs[0]).toMatchObject({ absoluteFilepathToOverlays: "/repo/fern/o.yml" });
        });

        it("ignores `settings` on every spec type", () => {
            const workspace = single([
                section([
                    { type: "openapi", path: "a.yml", settings: { "type-dates-as-strings": false } },
                    { type: "asyncapi", path: "b.yml", settings: { "type-dates-as-strings": false } },
                    { type: "graphql", path: "c.graphql", settings: { "type-dates-as-strings": false } }
                ])
            ]);
            for (const spec of workspace.allSpecs) {
                expect(spec).not.toHaveProperty("settings");
            }
        });

        // Odd but current behavior: any non-graphql, non-asyncapi type (including an unknown one) becomes openapi.
        it("treats an unrecognized spec type as openapi", () => {
            const workspace = single([section([{ type: "protobuf", path: "a.proto" }])]);
            expect(workspace.allSpecs[0]).toMatchObject({ type: "openapi", source: { type: "openapi" } });
            expect(workspace.specs).toHaveLength(1);
        });
    });
});
