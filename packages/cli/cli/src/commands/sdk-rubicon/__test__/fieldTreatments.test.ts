import { describe, expect, it } from "vitest";

import { FIELD_TREATMENT_OVERRIDES } from "../fieldTreatmentOverrides.js";
import { classifyFields, FIELD_TREATMENTS } from "../fieldTreatments.js";
import { HOSTED_FIELD_TREATMENTS } from "../hostedFieldTreatments.js";
import { mapSdkConfigToGeneratorsYml, RULES } from "../mapSdkConfigToGeneratorsYml.js";
import { irLeaves, nonDefaultLeaves, schemaLeafPaths } from "../walkIr.js";
import { cliIr, codes, facts } from "./helpers.js";

const INPUT = { configDir: "/work", outDir: "/work", generatorVersion: "0.49.0", specFacts: [facts()] };
const RULE_PATHS = new Set(RULES.flatMap((rule) => rule.paths));

describe("treatment table coverage", () => {
    const schemaPaths = schemaLeafPaths();

    it("lists every leaf path of sdkConfigIrV1Schema", () => {
        const missing = [...schemaPaths].filter((path) => FIELD_TREATMENTS[path] == null);
        expect(missing).toEqual([]);
    });

    it("lists no path that the schema does not have", () => {
        const extra = Object.keys(FIELD_TREATMENTS).filter((path) => !schemaPaths.has(path));
        expect(extra).toEqual([]);
    });

    it("uses only Map, Warn, Reject and Ignore", () => {
        const treatments = new Set(Object.values(FIELD_TREATMENTS).map((entry) => entry.treatment));
        expect([...treatments].filter((treatment) => !["Map", "Warn", "Reject", "Ignore"].includes(treatment))).toEqual(
            []
        );
    });

    it("has an override only for a path the hosted table lists", () => {
        const unknown = Object.keys(FIELD_TREATMENT_OVERRIDES).filter((path) => HOSTED_FIELD_TREATMENTS[path] == null);
        expect(unknown).toEqual([]);
    });

    it("has a rule for every Map path, and every path a rule claims is Map", () => {
        const unowned = Object.entries(FIELD_TREATMENTS)
            .filter(([path, entry]) => entry.treatment === "Map" && !RULE_PATHS.has(path))
            .map(([path]) => path);
        const notMap = [...RULE_PATHS].filter((path) => FIELD_TREATMENTS[path]?.treatment !== "Map");
        expect({ unowned, notMap }).toEqual({ unowned: [], notMap: [] });
    });
});

describe("rubicon overrides (D10)", () => {
    it.each([
        ["source.specs[].specUrl", "Map"],
        ["output.delivery", "Map"],
        ["output.path", "Map"],
        ["output.github.repository", "Map"],
        ["output.github.mode", "Map"],
        ["output.github.branch", "Map"],
        ["output.github.host", "Warn"],
        ["output.fileName", "Warn"],
        ["api.auth.schemes[].tokenHeader", "Map"],
        ["api.auth.schemes[].tokenPrefix", "Map"],
        ["api.auth.schemes[].flows[].refreshUrl", "Map"],
        ["api.auth.endpointSecurity", "Map"],
        ["target.generatorVersion", "Map"],
        ["target.sdkVersion", "Map"],
        ["target.apiName", "Ignore"]
    ])("treats %s as %s", (path, treatment) => {
        expect(FIELD_TREATMENTS[path]?.treatment).toBe(treatment);
    });
});

describe("walker", () => {
    it("drops defaulted fields with serializeSdkConfigIrV1 before walking", () => {
        const paths = nonDefaultLeaves(cliIr()).map((leaf) => leaf.schemaPath);
        expect(paths).not.toContain("api.baseUrl");
        expect(paths).not.toContain("client.timeoutMs");
    });

    it("produces no diagnostics for a minimal cli target", () => {
        expect(classifyFields(cliIr(), RULE_PATHS)).toEqual([]);
    });

    it("adds a warning for a Warn field, an error for a Reject field, nothing for Ignore", () => {
        const warned = classifyFields(cliIr({ client: { timeoutMs: 5000 } }), RULE_PATHS);
        expect(codes(warned)).toEqual(["warning RUBICON_IGNORED_FIELD client.timeoutMs"]);
        const rejected = classifyFields(
            cliIr({ package: { extraDependencies: [{ name: "serde", version: "1", extras: ["x"] }] } }),
            RULE_PATHS
        );
        expect(rejected.some((diagnostic) => diagnostic.code === "RUBICON_UNSUPPORTED_FIELD")).toBe(true);
        expect(
            classifyFields(
                cliIr({ source: { specs: [{ specType: "openapi", specUrl: "./o.yml", name: "N" }] } }),
                RULE_PATHS
            )
        ).toEqual([]);
    });

    it("warns for api.baseUrl and for a header value", () => {
        const diagnostics = classifyFields(
            cliIr({ api: { baseUrl: "https://x.test", headers: [{ name: "X-A", value: "v" }] } }),
            RULE_PATHS
        );
        expect(codes(diagnostics)).toEqual([
            "warning RUBICON_IGNORED_FIELD api.baseUrl",
            "warning RUBICON_IGNORED_FIELD api.headers[0].value"
        ]);
    });

    it("hands a Map field to its rule, and errors if no rule claims that path", () => {
        expect(classifyFields(cliIr({ api: { defaultEnvironment: "prod" } }), RULE_PATHS)).toEqual([]);
        const unclaimed = classifyFields(cliIr({ api: { defaultEnvironment: "prod" } }), new Set());
        expect(codes(unclaimed)).toContain("error RUBICON_UNOWNED_FIELD api.defaultEnvironment");
    });

    it("treats a record as one .* path and a union as the paths of all members", () => {
        const paths = schemaLeafPaths();
        expect([...paths].some((path) => path.includes(".*"))).toBe(true);
        expect(paths.has("api.auth.schemes[].tokenHeader")).toBe(true);
        expect(paths.has("api.auth.schemes[].location")).toBe(true);
    });

    it("uses the source.specs[].namespace form for array members, and [i] in display paths", () => {
        const leaves = irLeaves({ source: { specs: [{ namespace: "a" }, { namespace: "b" }] } });
        expect(leaves.map((leaf) => [leaf.schemaPath, leaf.displayPath])).toEqual([
            ["source.specs[].namespace", "source.specs[0].namespace"],
            ["source.specs[].namespace", "source.specs[1].namespace"]
        ]);
    });

    it("returns an error for an unknown non-default field", () => {
        const diagnostics = classifyFields(cliIr(), RULE_PATHS, () => [
            { schemaPath: "api.brandNew", displayPath: "api.brandNew", value: true }
        ]);
        expect(codes(diagnostics)).toEqual(["error RUBICON_UNKNOWN_FIELD api.brandNew"]);
    });
});

describe("mapper with classification", () => {
    it("stops before the rules when a field is rejected", () => {
        const result = mapSdkConfigToGeneratorsYml(
            cliIr({ package: { extraDependencies: [{ name: "serde", version: "1", extras: ["x"] }] } }),
            INPUT
        );
        expect(result.diagnostics.some((diagnostic) => diagnostic.code === "RUBICON_UNSUPPORTED_FIELD")).toBe(true);
        expect(result.generatorsYml).toEqual({});
    });

    it("reports warnings from the table and still maps", () => {
        const result = mapSdkConfigToGeneratorsYml(cliIr({ client: { timeoutMs: 5000 } }), INPUT);
        expect(codes(result.diagnostics)).toEqual(["warning RUBICON_IGNORED_FIELD client.timeoutMs"]);
        expect(result.generatorsYml.groups).toBeDefined();
    });
});
