import { describe, expect, it } from "vitest";

import { mapSdkConfigToGeneratorsYml } from "../../mapSdkConfigToGeneratorsYml.js";
import { cliIr, codes, facts } from "../helpers.js";

function map(api: Record<string, unknown>) {
    return mapSdkConfigToGeneratorsYml(cliIr({ api }), {
        configDir: "/work",
        outDir: "/work",
        generatorVersion: "0.49.0",
        specFacts: [facts()]
    });
}

function apiSection(result: ReturnType<typeof map>): Record<string, unknown> {
    const api = result.generatorsYml.api;
    return typeof api === "object" && api != null && !Array.isArray(api) ? { ...api } : {};
}

function cliGroup(result: ReturnType<typeof map>): unknown {
    const groups = result.generatorsYml.groups;
    return typeof groups === "object" && groups != null && "cli" in groups ? groups.cli : undefined;
}

describe("environments rule", () => {
    it("maps one URL per environment", () => {
        const result = map({ environments: [{ name: "prod", urls: [{ name: "api", url: "https://a.test" }] }] });
        expect(apiSection(result).environments).toEqual({ prod: "https://a.test" });
    });

    it("maps defaultEnvironment to default-environment", () => {
        const result = map({
            environments: [{ name: "prod", urls: [{ name: "api", url: "https://a.test" }] }],
            defaultEnvironment: "prod"
        });
        expect(apiSection(result)["default-environment"]).toBe("prod");
    });

    it("returns an error for several URLs in one environment", () => {
        const result = map({
            environments: [
                {
                    name: "prod",
                    urls: [
                        { name: "a", url: "https://a.test" },
                        { name: "b", url: "https://b.test" }
                    ]
                }
            ]
        });
        expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_MULTI_URL_ENVIRONMENT api.environments[0].urls"]);
    });

    it("writes no default-url for api.baseUrl", () => {
        expect(apiSection(map({ baseUrl: "https://x.test" }))).not.toHaveProperty("default-url");
    });

    it("writes audiences on the cli group", () => {
        expect(cliGroup(map({ audiences: ["public"] }))).toMatchObject({ audiences: ["public"] });
    });
});
