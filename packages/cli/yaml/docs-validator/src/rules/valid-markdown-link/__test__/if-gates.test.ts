import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import { checkIfPathnameExists } from "../check-if-pathname-exists.js";
import { collectLinksAndSources } from "../collect-links.js";
import { getPageScope, type IfGate, isVisibleInScope, type PageScope } from "../if-gates.js";

const v1Scope: PageScope = { versionNames: ["v1", "Version 1", "v1"], productNames: ["garden"] };
const v2Scope: PageScope = { versionNames: ["v2", "Version 2", "v2"], productNames: ["greenhouse"] };

function collectGates(content: string): (IfGate[] | undefined)[] {
    const { links } = collectLinksAndSources({
        content,
        absoluteFilepath: AbsoluteFilePath.of("/path/to/fern/pages/watering.mdx")
    });
    return links.map((link) => link.ifGates);
}

describe("collectLinksAndSources <If> gates", () => {
    it("attaches no gates to links outside <If>", () => {
        expect(collectGates("[Pruning](./pruning)")).toEqual([undefined]);
    });

    it("attaches versions, products and not gates", () => {
        const gates = collectGates(`
<If versions={["v1"]} not>
[Pruning](./pruning)
</If>

<If versions={["v2", "v3"]}>
[Repotting](./repotting)
</If>

<If products={["greenhouse"]}>
<a href="/greenhouse/misting">Misting</a>
</If>
`);
        expect(gates).toEqual([
            [{ versions: ["v1"], products: undefined, not: true }],
            [{ versions: ["v2", "v3"], products: undefined, not: false }],
            [{ versions: undefined, products: ["greenhouse"], not: false }]
        ]);
    });

    it("stacks gates of nested <If> blocks", () => {
        const gates = collectGates(`
<If products={["garden"]}>
<If versions={["v1"]} not={true}>
[Pruning](./pruning)
</If>
</If>
`);
        expect(gates).toEqual([
            [
                { versions: undefined, products: ["garden"], not: false },
                { versions: ["v1"], products: undefined, not: true }
            ]
        ]);
    });

    it("keeps the version gate of <If> blocks that also gate on roles", () => {
        expect(
            collectGates(`
<If roles={["admin"]} versions={["v1"]}>
[Pruning](./pruning)
</If>
`)
        ).toEqual([[{ versions: ["v1"], products: undefined, not: false }]]);
    });

    it("ignores negated <If> blocks that also gate on roles", () => {
        expect(
            collectGates(`
<If roles={["admin"]} versions={["v1"]} not>
[Pruning](./pruning)
</If>
`)
        ).toEqual([undefined]);
    });

    it("treats a string not attribute like the docs renderer", () => {
        expect(
            collectGates(`
<If versions={["v1"]} not="false">
[Pruning](./pruning)
</If>

<If versions={["v1"]} not={false}>
[Repotting](./repotting)
</If>
`)
        ).toEqual([
            [{ versions: ["v1"], products: undefined, not: true }],
            [{ versions: ["v1"], products: undefined, not: false }]
        ]);
    });
});

describe("getPageScope", () => {
    it("names the default version by its own slug, not the site prefix", () => {
        // the default version is also served under the site prefix, with its original slug kept as canonicalSlug
        const prunedDefaultVersion = {
            type: "version",
            versionId: "latest",
            title: "Latest",
            slug: "docs",
            canonicalSlug: "docs/latest"
        } as unknown as FernNavigation.NavigationNodeParent;
        const scope = getPageScope([prunedDefaultVersion]);
        expect(scope.versionNames).toEqual(["latest", "Latest", "latest"]);
        expect(isVisibleInScope([{ versions: ["docs"], not: true }], scope)).toBe(true);
    });
});

describe("isVisibleInScope", () => {
    it("is visible without gates", () => {
        expect(isVisibleInScope(undefined, v1Scope)).toBe(true);
        expect(isVisibleInScope([], undefined)).toBe(true);
    });

    it("matches versions and products", () => {
        const versionGate: IfGate[] = [{ versions: ["v2"], not: false }];
        expect(isVisibleInScope(versionGate, v1Scope)).toBe(false);
        expect(isVisibleInScope(versionGate, v2Scope)).toBe(true);

        const productGate: IfGate[] = [{ products: ["garden"], not: false }];
        expect(isVisibleInScope(productGate, v1Scope)).toBe(true);
        expect(isVisibleInScope(productGate, v2Scope)).toBe(false);
    });

    it("matches version display names", () => {
        expect(isVisibleInScope([{ versions: ["Version 2"], not: false }], v2Scope)).toBe(true);
    });

    it("inverts with not", () => {
        const gates: IfGate[] = [{ versions: ["v1"], not: true }];
        expect(isVisibleInScope(gates, v1Scope)).toBe(false);
        expect(isVisibleInScope(gates, v2Scope)).toBe(true);
    });

    it("requires every nested gate to match", () => {
        const gates: IfGate[] = [
            { products: ["garden"], not: false },
            { versions: ["v1"], not: true }
        ];
        expect(isVisibleInScope(gates, v1Scope)).toBe(false);
        expect(isVisibleInScope(gates, { versionNames: ["v2"], productNames: ["garden"] })).toBe(true);
    });

    it("requires both versions and products of a single gate to match", () => {
        const gates: IfGate[] = [{ versions: ["v1"], products: ["greenhouse"], not: false }];
        expect(isVisibleInScope(gates, v1Scope)).toBe(false);
        expect(isVisibleInScope(gates, { versionNames: ["v1"], productNames: ["greenhouse"] })).toBe(true);
    });

    it("hides version-gated content on pages without a version", () => {
        expect(isVisibleInScope([{ versions: ["v1"], not: false }], undefined)).toBe(false);
    });
});

describe("checkIfPathnameExists with <If> gates", () => {
    const absoluteFilepath = AbsoluteFilePath.of("/path/to/fern/pages/watering.mdx");
    const scopes = new Map<string, PageScope>([
        ["v1/guides/watering", v1Scope],
        ["v2/guides/watering", v2Scope]
    ]);
    const baseArgs = {
        pathname: "pruning",
        markdown: true,
        absoluteFilepath,
        workspaceAbsoluteFilePath: AbsoluteFilePath.of("/path/to/fern"),
        // pruning only exists in v2
        pageSlugs: new Set(["v1/guides/watering", "v2/guides/watering", "v2/guides/pruning"]),
        absoluteFilePathsToSlugs: new Map([[absoluteFilepath, ["v1/guides/watering", "v2/guides/watering"]]]),
        baseUrl: { domain: "docs.example.com" },
        versionSlugs: ["v1", "v2"]
    };

    it("reports the link as broken on every version without gates", async () => {
        expect(await checkIfPathnameExists(baseArgs)).toEqual(["v1/guides/watering"]);
    });

    it("skips versions where <If versions not> hides the link", async () => {
        const gates: IfGate[] = [{ versions: ["v1"], not: true }];
        expect(
            await checkIfPathnameExists({
                ...baseArgs,
                isSlugVisible: (slug) => isVisibleInScope(gates, scopes.get(slug))
            })
        ).toBe(true);
    });

    it("skips products where <If products> hides the link", async () => {
        const gates: IfGate[] = [{ products: ["greenhouse"], not: false }];
        expect(
            await checkIfPathnameExists({
                ...baseArgs,
                isSlugVisible: (slug) => isVisibleInScope(gates, scopes.get(slug))
            })
        ).toBe(true);
    });

    it("passes absolute links hidden on every slug of the page", async () => {
        const gates: IfGate[] = [{ versions: ["v3"], not: false }];
        expect(
            await checkIfPathnameExists({
                ...baseArgs,
                pathname: "/v3/guides/pruning",
                isSlugVisible: (slug) => isVisibleInScope(gates, scopes.get(slug))
            })
        ).toBe(true);
    });

    it("still reports broken links on versions where the link is visible", async () => {
        const gates: IfGate[] = [{ versions: ["v1"], not: false }];
        expect(
            await checkIfPathnameExists({
                ...baseArgs,
                isSlugVisible: (slug) => isVisibleInScope(gates, scopes.get(slug))
            })
        ).toEqual(["v1/guides/watering"]);
    });
});
