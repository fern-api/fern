import { describe, expect, it } from "vitest";

import { mapSdkConfigToGeneratorsYml } from "../../mapSdkConfigToGeneratorsYml.js";
import type { SpecFacts } from "../../types.js";
import { cliIr, codes, facts } from "../helpers.js";

function map(headers: Array<Record<string, unknown>>, specFacts: SpecFacts = facts()) {
    return mapSdkConfigToGeneratorsYml(cliIr({ api: { headers } }), {
        configDir: "/work",
        outDir: "/work",
        generatorVersion: "0.49.0",
        specFacts: [specFacts]
    });
}

function apiHeaders(result: ReturnType<typeof map>): unknown {
    const api = result.generatorsYml.api;
    return typeof api === "object" && api != null && "headers" in api ? api.headers : undefined;
}

describe("headers rule", () => {
    it("writes api.headers.<header> with type string, env and docs, and no name key", () => {
        const result = map([{ name: "X-Version", environmentVariable: "ACME_VERSION", description: "API version" }]);
        expect(apiHeaders(result)).toEqual({
            "X-Version": { type: "string", env: "ACME_VERSION", docs: "API version" }
        });
    });

    it("skips a header the spec declares as a parameter, ignoring case", () => {
        const result = map([{ name: "X-Op-Header" }], facts({ declaredHeaders: ["x-op-header"] }));
        expect(apiHeaders(result)).toBeUndefined();
        expect(result.diagnostics).toEqual([]);
    });

    it("skips a header the spec declares in x-fern-global-headers or x-fern-global-parameters", () => {
        const specFacts = facts({ declaredHeaders: ["x-global-header", "x-tenant-id"] });
        expect(apiHeaders(map([{ name: "X-Global-Header" }, { name: "X-Tenant-Id" }], specFacts))).toBeUndefined();
    });

    it("skips a header that is a header API-key scheme wire name, silently", () => {
        const result = map([{ name: "X-Api-Key" }], facts({ declaredHeaders: ["x-api-key"], schemeKeys: ["apikey"] }));
        expect(apiHeaders(result)).toBeUndefined();
        expect(result.diagnostics).toEqual([]);
    });

    it("skips a header that matches a header API-key scheme key, with RUBICON_HEADER_IS_SCHEME_KEY", () => {
        const result = map([{ name: "apiKey" }], facts({ declaredHeaders: ["x-api-key"], schemeKeys: ["apikey"] }));
        expect(apiHeaders(result)).toBeUndefined();
        expect(codes(result.diagnostics)).toEqual(["warning RUBICON_HEADER_IS_SCHEME_KEY api.headers[0].name"]);
    });

    it("checks every spec's facts", () => {
        const result = mapSdkConfigToGeneratorsYml(
            cliIr({
                source: {
                    specs: [
                        { specType: "openapi", specUrl: "./a.yml" },
                        { specType: "openapi", specUrl: "./b.yml" }
                    ]
                },
                api: { headers: [{ name: "X-B" }] }
            }),
            {
                configDir: "/work",
                outDir: "/work",
                generatorVersion: "0.49.0",
                specFacts: [facts(), facts({ declaredHeaders: ["x-b"] })]
            }
        );
        expect(apiHeaders(result)).toBeUndefined();
    });
});
