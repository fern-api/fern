import { describe, expect, it } from "vitest";
import { proposeAiRuleset } from "../aiCurated.js";
import { EndpointSummary } from "../openapiSummary.js";
import { buildMainResourcesPreset, buildReadOnlyPreset, isAmbiguousReadPost, isReadLikePost } from "../presets.js";
import { resolveTools } from "../toolset.js";

function endpoint(overrides: Partial<EndpointSummary>): EndpointSummary {
    return {
        method: "GET",
        path: "/pets",
        operationId: undefined,
        tags: [],
        summary: undefined,
        description: undefined,
        estimatedTokens: 100,
        deprecated: false,
        internal: false,
        schemaRefs: [],
        ...overrides
    };
}

describe("read-only preset", () => {
    it("includes GETs and read-like POSTs, excludes writes", () => {
        const endpoints = [
            endpoint({ method: "GET", path: "/pets", operationId: "listPets" }),
            endpoint({ method: "POST", path: "/pets/search", operationId: "searchPets" }),
            endpoint({ method: "POST", path: "/pets", operationId: "createPet" }),
            endpoint({ method: "DELETE", path: "/pets/{id}", operationId: "deletePet" })
        ];
        const preset = buildReadOnlyPreset(endpoints);
        const tools = resolveTools(endpoints, preset.config);
        expect(tools.map((tool) => tool.endpoint.operationId)).toEqual(["listPets", "searchPets"]);
    });

    it("detects read-like POSTs by operationId, path segment, and summary", () => {
        expect(isReadLikePost(endpoint({ method: "POST", operationId: "queryOrders" }))).toBe(true);
        expect(isReadLikePost(endpoint({ method: "POST", path: "/orders/search" }))).toBe(true);
        expect(isReadLikePost(endpoint({ method: "POST", summary: "List all orders" }))).toBe(true);
        expect(isReadLikePost(endpoint({ method: "POST", operationId: "createOrder" }))).toBe(false);
        expect(isReadLikePost(endpoint({ method: "GET", operationId: "listOrders" }))).toBe(false);
    });

    it("flags ambiguous read-like POSTs instead of including them", () => {
        const ambiguous = endpoint({ method: "POST", operationId: "runSavedSearch", path: "/reports/run" });
        expect(isReadLikePost(ambiguous)).toBe(false);
        expect(isAmbiguousReadPost(ambiguous)).toBe(true);
    });
});

function crudResource({
    name,
    tags,
    schemaRefs = []
}: {
    name: string;
    tags: string[];
    schemaRefs?: string[];
}): EndpointSummary[] {
    return [
        endpoint({ method: "GET", path: `/${name}`, tags, schemaRefs }),
        endpoint({ method: "GET", path: `/${name}/{id}`, tags, schemaRefs }),
        endpoint({ method: "POST", path: `/${name}`, tags, schemaRefs }),
        endpoint({ method: "PUT", path: `/${name}/{id}`, tags, schemaRefs }),
        endpoint({ method: "DELETE", path: `/${name}/{id}`, tags, schemaRefs })
    ];
}

describe("main-resources preset", () => {
    it("selects credible tagged resources and excludes admin/internal-like ones", () => {
        const endpoints = [
            ...crudResource({ name: "pets", tags: ["pets"] }),
            ...crudResource({ name: "orders", tags: ["orders"] }),
            endpoint({ path: "/admin/settings", tags: ["admin"] }),
            endpoint({ path: "/webhooks/events", tags: ["webhooks"] })
        ];
        const preset = buildMainResourcesPreset(endpoints);
        expect(preset.available).toBe(true);
        expect(preset.config.include?.map((selector) => selector.tag)).toEqual(
            expect.arrayContaining(["pets", "orders"])
        );
        expect(preset.config.exclude?.map((selector) => selector.tag)).toEqual(
            expect.arrayContaining(["admin", "webhooks"])
        );
    });

    it("falls back to path-prefix selectors on untagged specs with clean paths", () => {
        const endpoints = [
            ...crudResource({ name: "pets", tags: [], schemaRefs: ["Pet"] }),
            ...crudResource({ name: "orders", tags: [], schemaRefs: ["Order"] })
        ];
        const preset = buildMainResourcesPreset(endpoints);
        expect(preset.available).toBe(true);
        expect(preset.config.include?.map((selector) => selector["path-prefix"])).toEqual(
            expect.arrayContaining(["/pets", "/orders"])
        );
        expect(preset.config.include?.every((selector) => selector.tag == null)).toBe(true);
    });

    it("strips version prefixes when clustering paths", () => {
        const endpoints = [
            endpoint({ method: "GET", path: "/v1/pets", tags: [], schemaRefs: ["Pet"] }),
            endpoint({ method: "GET", path: "/v1/pets/{id}", tags: [], schemaRefs: ["Pet"] }),
            endpoint({ method: "POST", path: "/v1/pets", tags: [], schemaRefs: ["Pet"] }),
            endpoint({ method: "DELETE", path: "/v1/pets/{id}", tags: [], schemaRefs: ["Pet"] })
        ];
        const preset = buildMainResourcesPreset(endpoints);
        expect(preset.available).toBe(true);
        expect(preset.config.include?.map((selector) => selector["path-prefix"])).toEqual(["/v1/pets"]);
    });

    it("uses schema centrality to rescue resources on team-tagged specs", () => {
        const endpoints = [
            ...crudResource({ name: "pets", tags: ["team-growth"], schemaRefs: ["Pet"] }),
            endpoint({ method: "GET", path: "/reports/pets", tags: ["team-data"], schemaRefs: ["Pet"] })
        ];
        const preset = buildMainResourcesPreset(endpoints);
        expect(preset.available).toBe(true);
        expect(preset.label).toContain("pets");
        expect(preset.config.include?.some((selector) => selector["path-prefix"] === "/pets")).toBe(true);
    });

    it("trips the confidence gate when scores are flat with weak CRUD", () => {
        const endpoints = [
            endpoint({ method: "GET", path: "/alpha", tags: ["alpha"] }),
            endpoint({ method: "GET", path: "/beta", tags: ["beta"] }),
            endpoint({ method: "GET", path: "/gamma", tags: ["gamma"] }),
            endpoint({ method: "GET", path: "/delta", tags: ["delta"] })
        ];
        const preset = buildMainResourcesPreset(endpoints);
        expect(preset.available).toBe(false);
        expect(preset.unavailableReason).toContain("flat");
    });

    it("is unavailable when no signals agree", () => {
        const endpoints = [
            endpoint({ method: "GET", path: "/pets", tags: ["team-a"] }),
            endpoint({ method: "GET", path: "/orders", tags: ["team-b"] })
        ];
        const preset = buildMainResourcesPreset(endpoints);
        expect(preset.available).toBe(false);
        expect(preset.unavailableReason).toBeDefined();
    });

    it("excludes deprecated and x-internal endpoints from the selection", () => {
        const deprecatedEndpoint = endpoint({
            method: "POST",
            path: "/pets/legacy-create",
            tags: ["pets"],
            deprecated: true
        });
        const internalEndpoint = endpoint({
            method: "GET",
            path: "/pets/debug",
            tags: ["pets"],
            internal: true
        });
        const endpoints = [...crudResource({ name: "pets", tags: ["pets"] }), deprecatedEndpoint, internalEndpoint];
        const preset = buildMainResourcesPreset(endpoints);
        expect(preset.available).toBe(true);
        const tools = resolveTools(endpoints, preset.config);
        expect(tools.some((tool) => tool.endpoint.deprecated || tool.endpoint.internal)).toBe(false);
    });

    it("trims lowest-scoring resources until the verdict is green", () => {
        const bigResource = (name: string, count: number): EndpointSummary[] =>
            Array.from({ length: count }, (_, index) =>
                endpoint({ method: "GET", path: `/${name}/{id${index}}`, tags: [name], schemaRefs: [name] })
            );
        const endpoints = [
            ...crudResource({ name: "pets", tags: ["pets"] }),
            ...bigResource("orders", 25),
            ...bigResource("stores", 25)
        ];
        const preset = buildMainResourcesPreset(endpoints);
        expect(preset.available).toBe(true);
        expect(preset.verdict.level).toBe("green");
        expect(preset.verdict.toolCount).toBeLessThanOrEqual(40);
    });
});

describe("AI-curated proposal (stub)", () => {
    const endpoints = [
        endpoint({ tags: ["payments"] }),
        endpoint({ method: "POST", path: "/refunds", tags: ["refunds"] }),
        endpoint({ method: "DELETE", path: "/payments/{id}", tags: ["payments"] })
    ];

    it("excludes negated tags and presents exclusions", () => {
        const proposal = proposeAiRuleset("help with payments but never touch refunds", endpoints);
        expect(proposal.config.exclude).toEqual(expect.arrayContaining([{ tag: "refunds" }]));
        expect(proposal.excludeReasons.length).toBeGreaterThan(0);
        expect(proposal.config.include).toEqual(expect.arrayContaining([{ tag: "payments" }]));
    });

    it("excludes DELETE when the intent forbids deleting", () => {
        const proposal = proposeAiRuleset("manage payments, never delete anything", endpoints);
        expect(proposal.config.exclude).toEqual(expect.arrayContaining([{ method: "DELETE" }]));
    });

    it("persists the intent and defaults to read-only includes", () => {
        const proposal = proposeAiRuleset("just browse things", endpoints);
        expect(proposal.config.intent).toBe("just browse things");
        expect(proposal.config.include).toEqual([{ method: "GET" }]);
    });
});
