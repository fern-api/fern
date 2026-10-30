import { describe, expect, it } from "vitest";

import {
    appendRequiredScopesToEndpointDocs,
    type EndpointWithSecurity
} from "../appendRequiredScopesToEndpointDocs.js";

type IrServices = Parameters<typeof appendRequiredScopesToEndpointDocs>[0];

function createIr(endpoints: EndpointWithSecurity[]): IrServices {
    return { services: { service_plants: { endpoints: endpoints.map((endpoint) => ({ ...endpoint })) } } };
}

function getDocs(ir: IrServices): Array<string | undefined> {
    return Object.values(ir.services).flatMap((service) => service.endpoints.map((endpoint) => endpoint.docs));
}

describe("appendRequiredScopesToEndpointDocs", () => {
    it("appends scopes to an existing description", () => {
        const ir = createIr([{ docs: "List plants.", security: [{ OAuth: ["plants:read"] }] }]);
        appendRequiredScopesToEndpointDocs(ir);
        expect(getDocs(ir)).toEqual(["List plants.\n\n**Required scopes:** `plants:read`"]);
    });

    it("sets the description when the endpoint has none", () => {
        const ir = createIr([{ docs: undefined, security: [{ OAuth: ["plants:read", "plants:write"] }] }]);
        appendRequiredScopesToEndpointDocs(ir);
        expect(getDocs(ir)).toEqual(["**Required scopes:** `plants:read`, `plants:write`"]);
    });

    it("joins alternative security requirements with 'or'", () => {
        const ir = createIr([
            {
                docs: "Water a plant.",
                security: [{ OAuth: ["plants:write"] }, { ApiKey: [] }, { OAuth: ["garden:admin"] }]
            }
        ]);
        appendRequiredScopesToEndpointDocs(ir);
        expect(getDocs(ir)).toEqual(["Water a plant.\n\n**Required scopes:** `plants:write` or `garden:admin`"]);
    });

    it("leaves endpoints without scopes unchanged", () => {
        const ir = createIr([
            { docs: "Get a plant.", security: undefined },
            { docs: "Get a seed.", security: [{ ApiKey: [] }] }
        ]);
        appendRequiredScopesToEndpointDocs(ir);
        expect(getDocs(ir)).toEqual(["Get a plant.", "Get a seed."]);
    });

    it("does not append twice", () => {
        const ir = createIr([{ docs: "List plants.", security: [{ OAuth: ["plants:read"] }] }]);
        appendRequiredScopesToEndpointDocs(ir);
        appendRequiredScopesToEndpointDocs(ir);
        expect(getDocs(ir)).toEqual(["List plants.\n\n**Required scopes:** `plants:read`"]);
    });
});
