import { describe, expect, it } from "vitest";

import { EndpointSummary } from "../openapiSummary.js";
import { computeVerdict, resolveTools, toolNameForEndpoint } from "../toolset.js";

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

const ENDPOINTS: EndpointSummary[] = [
    endpoint({ method: "GET", path: "/pets", operationId: "listPets", tags: ["pets"] }),
    endpoint({ method: "POST", path: "/pets", operationId: "createPet", tags: ["pets"] }),
    endpoint({ method: "DELETE", path: "/pets/{id}", operationId: "deletePet", tags: ["pets"] }),
    endpoint({ method: "GET", path: "/admin/users", operationId: "listUsers", tags: ["admin"] })
];

describe("resolveTools", () => {
    it("returns all endpoints for an empty config", () => {
        expect(resolveTools(ENDPOINTS, {})).toHaveLength(4);
    });

    it("ANDs fields within a selector", () => {
        const tools = resolveTools(ENDPOINTS, { include: [{ tag: "pets", method: "GET" }] });
        expect(tools.map((tool) => tool.endpoint.operationId)).toEqual(["listPets"]);
    });

    it("ORs selectors across the include list", () => {
        const tools = resolveTools(ENDPOINTS, { include: [{ method: "DELETE" }, { tag: "admin" }] });
        expect(tools.map((tool) => tool.endpoint.operationId)).toEqual(["deletePet", "listUsers"]);
    });

    it("lets exclude win over include", () => {
        const tools = resolveTools(ENDPOINTS, { include: [{ tag: "pets" }], exclude: [{ method: "DELETE" }] });
        expect(tools.map((tool) => tool.endpoint.operationId)).toEqual(["listPets", "createPet"]);
    });

    it("matches path prefixes", () => {
        const tools = resolveTools(ENDPOINTS, { include: [{ "path-prefix": "/admin" }] });
        expect(tools.map((tool) => tool.endpoint.operationId)).toEqual(["listUsers"]);
    });

    it("matches exact endpoints", () => {
        const tools = resolveTools(ENDPOINTS, { include: [{ endpoint: "POST /pets" }] });
        expect(tools.map((tool) => tool.endpoint.operationId)).toEqual(["createPet"]);
    });
});

describe("toolNameForEndpoint", () => {
    it("prefers the operationId in snake_case", () => {
        expect(toolNameForEndpoint(endpoint({ operationId: "listPets" }))).toBe("list_pets");
    });

    it("falls back to method + path", () => {
        expect(toolNameForEndpoint(endpoint({ method: "GET", path: "/pets/{id}" }))).toBe("get_pets_id");
    });
});

describe("computeVerdict", () => {
    it("is green within budget", () => {
        const verdict = computeVerdict(resolveTools(ENDPOINTS, {}), { maxTools: 40, maxTokens: 60_000 });
        expect(verdict.level).toBe("green");
        expect(verdict.toolCount).toBe(4);
    });

    it("is amber when over budget but within 3x", () => {
        const many = Array.from({ length: 80 }, (_, index) => endpoint({ path: `/things/${index}` }));
        const verdict = computeVerdict(resolveTools(many, {}), { maxTools: 40, maxTokens: 60_000 });
        expect(verdict.level).toBe("amber");
    });

    it("is red when over 3x budget", () => {
        const many = Array.from({ length: 200 }, (_, index) => endpoint({ path: `/things/${index}` }));
        const verdict = computeVerdict(resolveTools(many, {}), { maxTools: 40, maxTokens: 60_000 });
        expect(verdict.level).toBe("red");
    });

    it("takes the worse of the two clauses", () => {
        const heavy = [endpoint({ estimatedTokens: 70_000 })];
        const verdict = computeVerdict(resolveTools(heavy, {}), { maxTools: 40, maxTokens: 60_000 });
        expect(verdict.level).toBe("amber");
    });
});
