import { describe, expect, it } from "vitest";

import { mapSdkConfigToGeneratorsYml } from "../../mapSdkConfigToGeneratorsYml.js";
import type { SpecFacts } from "../../types.js";
import { cliIr, codes, errorCodes, facts } from "../helpers.js";

function map(auth: Record<string, unknown>, specFacts: SpecFacts = facts()) {
    return mapSdkConfigToGeneratorsYml(cliIr({ api: { auth } }), {
        configDir: "/work",
        outDir: "/work",
        generatorVersion: "0.49.0",
        specFacts: [specFacts]
    });
}

function section(result: ReturnType<typeof map>, key: string): unknown {
    return result.generatorsYml[key];
}

function apiAuth(result: ReturnType<typeof map>): unknown {
    const api = result.generatorsYml.api;
    return typeof api === "object" && api != null && "auth" in api ? api.auth : undefined;
}

const basic = { id: "basic", type: "basic" };
const bearerEnv = { id: "bearer", type: "bearer", environmentVariable: "ACME_TOKEN" };
const headerKey = { id: "key", type: "api-key", location: "header", name: "X-Api-Key" };

describe("auth rule", () => {
    it("writes no auth-schemes entry for a scheme that adds no env var or omit, when no requirement names it", () => {
        const result = map({ schemes: [basic, bearerEnv], requirements: [{ schemes: ["bearer"] }] });
        expect(section(result, "auth-schemes")).toEqual({ bearer: { scheme: "bearer", token: { env: "ACME_TOKEN" } } });
    });

    it("writes a basic entry with username and password env and omit", () => {
        const result = map({
            schemes: [{ ...basic, username: { environmentVariable: "ACME_USER" }, password: { omit: true } }]
        });
        expect(section(result, "auth-schemes")).toEqual({
            basic: { scheme: "basic", username: { env: "ACME_USER" }, password: { omit: true } }
        });
    });

    it("writes a bearer entry with token env", () => {
        expect(section(map({ schemes: [bearerEnv] }), "auth-schemes")).toEqual({
            bearer: { scheme: "bearer", token: { env: "ACME_TOKEN" } }
        });
    });

    it("writes a header entry for a header API key with env and prefix", () => {
        const result = map({ schemes: [{ ...headerKey, environmentVariable: "ACME_KEY", prefix: "Key" }] });
        expect(section(result, "auth-schemes")).toEqual({
            key: { header: "X-Api-Key", type: "string", env: "ACME_KEY", prefix: "Key" }
        });
    });

    it("returns an error for an API key in query or cookie", () => {
        for (const location of ["query", "cookie"]) {
            const result = map({ schemes: [{ ...headerKey, location }] });
            expect(codes(result.diagnostics)).toEqual(["error RUBICON_API_KEY_LOCATION api.auth.schemes[0].location"]);
        }
    });

    it("returns an error for a bearer prefix and for a custom bearer header", () => {
        expect(errorCodes(map({ schemes: [{ ...bearerEnv, prefix: "Token" }] }).diagnostics)).toEqual([
            "RUBICON_BEARER_PREFIX"
        ]);
        expect(errorCodes(map({ schemes: [{ ...bearerEnv, header: "X-Token" }] }).diagnostics)).toEqual([
            "RUBICON_BEARER_HEADER"
        ]);
    });

    it("rejects a custom auth scheme through the treatment table", () => {
        const result = map({
            schemes: [{ id: "c", type: "custom", parameters: [{ name: "X-C", location: "header" }] }]
        });
        expect(codes(result.diagnostics)).toContain(
            "error RUBICON_UNSUPPORTED_FIELD api.auth.schemes[0].parameters[0].name"
        );
    });

    it("maps one requirement to a single id", () => {
        expect(apiAuth(map({ schemes: [bearerEnv], requirements: [{ schemes: ["bearer"] }] }))).toBe("bearer");
    });

    it("maps several requirements to any:", () => {
        const result = map({
            schemes: [bearerEnv, { ...headerKey, environmentVariable: "K" }],
            requirements: [{ schemes: ["bearer"] }, { schemes: ["key"] }]
        });
        expect(apiAuth(result)).toEqual({ any: ["bearer", "key"] });
    });

    it("returns an error for a requirement with several schemes (no all:)", () => {
        const result = map({ schemes: [bearerEnv, headerKey], requirements: [{ schemes: ["bearer", "key"] }] });
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_AUTH_ALL api.auth.requirements[0].schemes"]);
    });

    it("writes api.auth from requirements even when no scheme has an entry", () => {
        const result = map({ schemes: [basic], requirements: [{ schemes: ["basic"] }] });
        expect(apiAuth(result)).toBe("basic");
    });

    it("adds a minimal entry for each scheme api.auth names that has none: basic, bearer, header", () => {
        const result = map({
            schemes: [basic, { id: "bearer", type: "bearer" }, headerKey],
            requirements: [{ schemes: ["basic"] }, { schemes: ["bearer"] }, { schemes: ["key"] }]
        });
        expect(section(result, "auth-schemes")).toEqual({
            basic: { scheme: "basic" },
            bearer: { scheme: "bearer" },
            key: { header: "X-Api-Key", type: "string" }
        });
        expect(apiAuth(result)).toEqual({ any: ["basic", "bearer", "key"] });
    });

    it("uses the schemes that have entries as alternatives when there are no requirements", () => {
        const result = map({ schemes: [basic, bearerEnv, { ...headerKey, environmentVariable: "K" }] });
        expect(apiAuth(result)).toEqual({ any: ["bearer", "key"] });
    });

    it("writes endpoint-security with a warning when endpointSecurity is set", () => {
        const result = map({ schemes: [bearerEnv], endpointSecurity: true });
        expect(apiAuth(result)).toEqual({ "endpoint-security": {} });
        expect(codes(result.diagnostics)).toContain("warning RUBICON_ENDPOINT_SECURITY api.auth.endpointSecurity");
    });
});
