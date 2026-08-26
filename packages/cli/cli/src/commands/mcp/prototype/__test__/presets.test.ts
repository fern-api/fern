import { describe, expect, it } from "vitest";

import { EndpointSummary } from "../openapiSummary.js";
import { buildMainResourcesPreset, buildReadOnlyPreset, isAmbiguousReadPost, isReadLikePost } from "../presets.js";
import { proposeAiRuleset } from "../aiCurated.js";
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

describe("main-resources preset", () => {
    it("ranks tags and excludes admin/internal-like ones", () => {
        const endpoints = [
            ...["GET", "POST", "PUT", "DELETE"].map((method) => endpoint({ method, tags: ["pets"] })),
            ...["GET", "POST"].map((method) => endpoint({ method, path: "/orders", tags: ["orders"] })),
            endpoint({ path: "/admin", tags: ["admin"] }),
            endpoint({ path: "/hooks", tags: ["webhooks"] })
        ];
        const preset = buildMainResourcesPreset(endpoints);
        expect(preset.available).toBe(true);
        expect(preset.config.include?.map((selector) => selector.tag)).toEqual(["pets", "orders"]);
        expect(preset.config.exclude?.map((selector) => selector.tag)).toEqual(
            expect.arrayContaining(["admin", "webhooks"])
        );
    });

    it("is unavailable on tag-less specs", () => {
        const preset = buildMainResourcesPreset([endpoint({}), endpoint({ path: "/orders" })]);
        expect(preset.available).toBe(false);
        expect(preset.unavailableReason).toBeDefined();
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
