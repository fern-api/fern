import { describe, expect, it } from "vitest";

import { mapSdkConfigToGeneratorsYml, RULES } from "../mapSdkConfigToGeneratorsYml.js";
import { cliIr, codes, facts } from "./helpers.js";

const INPUT = { configDir: "/work", outDir: "/work", generatorVersion: "0.49.0", specFacts: [facts()] };

describe("mapSdkConfigToGeneratorsYml", () => {
    it("returns { generatorsYml, overlayMerges, diagnostics, hints }", () => {
        const result = mapSdkConfigToGeneratorsYml(cliIr(), INPUT);
        expect(Object.keys(result).sort()).toEqual(["diagnostics", "generatorsYml", "hints", "overlayMerges"]);
    });

    it("runs oauth before auth", () => {
        const names = RULES.map((rule) => rule.name);
        expect(names.indexOf("oauth")).toBeLessThan(names.indexOf("auth"));
    });

    it("reports diagnostic paths in SDK Config form, for example api.auth.schemes[0].location", () => {
        const result = mapSdkConfigToGeneratorsYml(
            cliIr({ api: { auth: { schemes: [{ id: "k", type: "api-key", location: "query", name: "key" }] } } }),
            INPUT
        );
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_API_KEY_LOCATION api.auth.schemes[0].location"]);
    });

    it("maps a minimal cli target to api.specs and one cli group only, in Fern's section order", () => {
        const result = mapSdkConfigToGeneratorsYml(cliIr(), INPUT);
        expect(result.diagnostics).toEqual([]);
        expect(result.generatorsYml).toEqual({
            api: { specs: [{ openapi: "./openapi.yml" }] },
            groups: {
                cli: {
                    generators: [
                        {
                            name: "fernapi/fern-cli-generator",
                            version: "0.49.0",
                            output: { location: "local-file-system", path: "./generated/cli" }
                        }
                    ]
                }
            }
        });
    });

    it("writes auth-schemes before api and groups", () => {
        const result = mapSdkConfigToGeneratorsYml(
            cliIr({ api: { auth: { schemes: [{ id: "b", type: "bearer", environmentVariable: "T" }] } } }),
            INPUT
        );
        expect(Object.keys(result.generatorsYml)).toEqual(["auth-schemes", "api", "groups"]);
    });

    // The prototype's import-settings case (prototype:test/unit.test.mjs), unchanged by D10 for one spec.
    it("matches the prototype output for import settings at the root of a single-spec config", () => {
        const result = mapSdkConfigToGeneratorsYml(
            cliIr({
                source: {
                    specs: [{ specType: "openapi", specUrl: "./openapi.yml", id: "main" }],
                    apiImportSettings: { titleAsSchemaName: false, undiscriminatedUnionsWithLiterals: true }
                }
            }),
            INPUT
        );
        const expected = { "title-as-schema-name": false, "prefer-undiscriminated-unions-with-literals": true };
        expect(result.generatorsYml.api).toEqual({
            specs: [{ openapi: "./openapi.yml", settings: expected }],
            settings: expected
        });
    });

    // The prototype's bearer case, unchanged: an env var gives an entry and api.auth names it.
    it("matches the prototype output for a bearer scheme with an env var", () => {
        const result = mapSdkConfigToGeneratorsYml(
            cliIr({ api: { auth: { schemes: [{ id: "b", type: "bearer", environmentVariable: "ACME_TOKEN" }] } } }),
            INPUT
        );
        expect(result.generatorsYml["auth-schemes"]).toEqual({ b: { scheme: "bearer", token: { env: "ACME_TOKEN" } } });
        expect(result.generatorsYml.api).toMatchObject({ auth: "b" });
    });
});
