import { resolveSnippetPackageName } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import type { FernWorkspace } from "@fern-api/workspace-loader";
import { beforeAll, describe, expect, it } from "vitest";

import { getDynamicGeneratorConfig } from "../getDynamicGeneratorConfig.js";
import {
    collectSnippetGeneratorCandidates,
    getDocsSnippetPackageName,
    getSoleUnnamedGenerator,
    selectVersionGeneratorForSnippet
} from "../publishDocs.js";

const FIXTURE = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures/github-only-snippets/fern/apis/voice")
);
const DOCS_ONLY_FIXTURE = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures/github-only-snippets/fern/apis/voice-docs")
);

// These tests go through the real generators.yml loader so the invocations have the
// exact shape production sees (resolved `config`, githubV2 output mode, no publishInfo).
describe("snippet package name from a parsed generators.yml", () => {
    let generators: generatorsYml.GeneratorInvocation[];
    let python: generatorsYml.GeneratorInvocation;
    let typescript: generatorsYml.GeneratorInvocation;
    let php: generatorsYml.GeneratorInvocation;

    beforeAll(async () => {
        const config = await loadGeneratorsConfiguration({
            absolutePathToWorkspace: FIXTURE,
            context: createMockTaskContext()
        });
        generators = config?.groups.flatMap((group) => group.generators) ?? [];
        python = byLanguage(generators, "python");
        typescript = byLanguage(generators, "typescript");
        php = byLanguage(generators, "php");
    });

    it("loads github-only generators with githubV2 output and no publish info", () => {
        expect(generators).toHaveLength(3);
        for (const gi of generators) {
            expect(gi.outputMode.type).toBe("githubV2");
            expect(generatorsYml.getPackageName({ generatorInvocation: gi })).toBeUndefined();
        }
    });

    it("python resolves config.package_name", () => {
        expect(resolveSnippetPackageName(python)).toBe("smallestai");
        expect(docsPackageName(python)).toBe("smallestai");
    });

    it("php resolves config.packageName", () => {
        expect(resolveSnippetPackageName(php)).toBe("smallest/smallestai");
        expect(docsPackageName(php)).toBe("smallest/smallestai");
    });

    it("typescript has no package-name config key, so it is the sole unnamed generator for its language", () => {
        expect(resolveSnippetPackageName(typescript)).toBeUndefined();
        expect(docsPackageName(typescript)).toBeUndefined();
        expect(getSoleUnnamedGenerator([typescript])).toBe(typescript);
        expect(getSoleUnnamedGenerator([python])).toBeUndefined();
    });

    it("docs version lookup selects the python generator for snippets package smallestai", () => {
        expect(selectVersionGeneratorForSnippet({ generators, language: "python", snippetName: "smallestai" })).toEqual(
            {
                generatorName: "fernapi/fern-python-sdk",
                generatorPackage: "smallestai",
                githubRepository: "smallest-inc/smallest-python-sdk",
                matchesSnippetName: true
            }
        );
    });

    it("docs version lookup assumes the sole typescript generator publishes the snippets package", () => {
        expect(
            selectVersionGeneratorForSnippet({ generators, language: "typescript", snippetName: "smallestai" })
        ).toEqual({
            generatorName: "fernapi/fern-typescript-sdk",
            generatorPackage: "smallestai",
            githubRepository: "smallest-inc/smallest-typescript-sdk",
            matchesSnippetName: true,
            assumedFromSnippetName: true
        });
    });

    it("does not match a python snippets package that differs from config.package_name", () => {
        expect(
            selectVersionGeneratorForSnippet({ generators, language: "python", snippetName: "other" })
        ).toBeUndefined();
    });
});

function byLanguage(
    generators: generatorsYml.GeneratorInvocation[],
    language: string
): generatorsYml.GeneratorInvocation {
    const found = generators.find((gi) => gi.language === language);
    if (found == null) {
        throw new Error(`fixture has no ${language} generator`);
    }
    return found;
}

function docsPackageName(gi: generatorsYml.GeneratorInvocation): string | undefined {
    return getDocsSnippetPackageName({
        generatorInvocation: gi,
        dynamicGeneratorConfig: getDynamicGeneratorConfig({
            apiName: "voice",
            organization: "smallest-ai",
            generatorInvocation: gi
        })
    });
}

// Mirrors the customer layout: docs.yml points at a docs-only API workspace (`api:` only, no
// groups) while the SDK generators live in a sibling workspace of the same fern folder.
describe("snippet generator candidates across API workspaces", () => {
    let sdkGenerators: generatorsYml.GeneratorInvocation[];
    let docsOnlyConfig: generatorsYml.GeneratorsConfiguration | undefined;

    beforeAll(async () => {
        const context = createMockTaskContext();
        sdkGenerators =
            (await loadGeneratorsConfiguration({ absolutePathToWorkspace: FIXTURE, context }))?.groups.flatMap(
                (group) => group.generators
            ) ?? [];
        docsOnlyConfig = await loadGeneratorsConfiguration({ absolutePathToWorkspace: DOCS_ONLY_FIXTURE, context });
    });

    it("parses the docs-only workspace with no generators", () => {
        expect(docsOnlyConfig).toBeDefined();
        expect(docsOnlyConfig?.groups ?? []).toHaveLength(0);
    });

    it("borrows generators from sibling API workspaces when the docs workspace has none", () => {
        const docsWorkspace = asWorkspace("voice-docs", docsOnlyConfig);
        const candidates = collectSnippetGeneratorCandidates({
            workspace: docsWorkspace,
            apiWorkspaces: [docsWorkspace, asWorkspace("voice", { groups: groupsOf(sdkGenerators) })],
            context: createMockTaskContext()
        });
        expect(candidates.map((gi) => gi.language)).toEqual(["python", "typescript", "php"]);
        expect(
            selectVersionGeneratorForSnippet({ generators: candidates, language: "python", snippetName: "smallestai" })
        ).toMatchObject({ generatorPackage: "smallestai", matchesSnippetName: true });
    });

    it("lists the workspace's own generators first and skips itself when borrowing", () => {
        const sdkWorkspace = asWorkspace("voice", { groups: groupsOf(sdkGenerators) });
        const candidates = collectSnippetGeneratorCandidates({
            workspace: sdkWorkspace,
            apiWorkspaces: [sdkWorkspace, asWorkspace("voice-docs", docsOnlyConfig)],
            context: createMockTaskContext()
        });
        expect(candidates).toHaveLength(3);
    });

    it("returns nothing when no workspace in the fern folder has generators", () => {
        const docsWorkspace = asWorkspace("voice-docs", docsOnlyConfig);
        expect(
            collectSnippetGeneratorCandidates({
                workspace: docsWorkspace,
                apiWorkspaces: [docsWorkspace],
                context: createMockTaskContext()
            })
        ).toEqual([]);
    });
});

function groupsOf(generators: generatorsYml.GeneratorInvocation[]): generatorsYml.GeneratorGroup[] {
    return [{ groupName: "sdk", audiences: { type: "all" }, generators, reviewers: undefined }];
}

function asWorkspace(
    workspaceName: string,
    generatorsConfiguration: Partial<generatorsYml.GeneratorsConfiguration> | undefined
): FernWorkspace {
    // Only the two fields the candidate collector reads are needed.
    return { workspaceName, generatorsConfiguration } as unknown as FernWorkspace;
}
