import { describe, expect, it } from "vitest";

import { mapSdkConfigToGeneratorsYml } from "../../mapSdkConfigToGeneratorsYml.js";
import { cliIr, codes, errorCodes, facts, warningCodes } from "../helpers.js";

const DIRS = { configDir: "/work/fern", outDir: "/work/fern", generatorVersion: "0.49.0" };

function map(source: Record<string, unknown>, outDir = DIRS.outDir) {
    const ir = cliIr({ source });
    return mapSdkConfigToGeneratorsYml(ir, {
        ...DIRS,
        outDir,
        specFacts: ir.source.specs.map(() => facts())
    });
}

function api(result: ReturnType<typeof map>): Record<string, unknown> {
    const value = result.generatorsYml.api;
    return typeof value === "object" && value != null && !Array.isArray(value) ? { ...value } : {};
}

const spec = (extra: Record<string, unknown> = {}) => ({ specType: "openapi", specUrl: "./openapi.yml", ...extra });

describe("specs rule", () => {
    it("writes an openapi spec under api.specs[].openapi, relative to the output folder", () => {
        expect(api(map({ specs: [spec()] })).specs).toEqual([{ openapi: "./openapi.yml" }]);
        expect(api(map({ specs: [spec()] }, "/work")).specs).toEqual([{ openapi: "./fern/openapi.yml" }]);
        expect(api(map({ specs: [spec()] }, "/work/fern/out")).specs).toEqual([{ openapi: "../openapi.yml" }]);
    });

    it("writes a swagger spec under openapi as well", () => {
        expect(api(map({ specs: [spec({ specType: "swagger", specUrl: "./swagger.json" })] })).specs).toEqual([
            { openapi: "./swagger.json" }
        ]);
    });

    it("keeps the order of source.specs", () => {
        const result = map({ specs: [spec({ specUrl: "./b.yml" }), spec({ specUrl: "./a.yml" })] });
        expect(api(result).specs).toEqual([{ openapi: "./b.yml" }, { openapi: "./a.yml" }]);
    });

    it("maps namespace", () => {
        expect(api(map({ specs: [spec({ namespace: "users" })] })).specs).toEqual([
            { openapi: "./openapi.yml", namespace: "users" }
        ]);
    });

    it("maps one overrides file as a string and several as a list, with a warning for several", () => {
        expect(api(map({ specs: [spec({ overrides: ["./o.yml"] })] })).specs).toEqual([
            { openapi: "./openapi.yml", overrides: "./o.yml" }
        ]);
        const several = map({ specs: [spec({ overrides: ["./a.yml", "./b.yml"] })] });
        expect(api(several).specs).toEqual([{ openapi: "./openapi.yml", overrides: ["./a.yml", "./b.yml"] }]);
        expect(codes(several.diagnostics)).toContain("warning CLI_TARGET_UNTESTED source.specs[0].overrides");
    });

    it("references a single overlay directly", () => {
        expect(api(map({ specs: [spec({ overlays: ["./ov.yml"] })] })).specs).toEqual([
            { openapi: "./openapi.yml", overlays: "./ov.yml" }
        ]);
    });

    it("merges several overlays into .cli-target/overlay-<id>.yml and returns them as a merge to write", () => {
        const result = map({ specs: [spec({ id: "main", overlays: ["./a.yml", "./b.yml"] })] });
        expect(api(result).specs).toEqual([{ openapi: "./openapi.yml", overlays: "./.cli-target/overlay-main.yml" }]);
        expect(result.overlayMerges).toEqual([
            { path: "/work/fern/.cli-target/overlay-main.yml", overlayPaths: ["/work/fern/a.yml", "/work/fern/b.yml"] }
        ]);
    });

    it("writes import settings in kebab-case under each spec", () => {
        const result = map({ specs: [spec({ apiImportSettings: { titleAsSchemaName: false } })] });
        expect(api(result).specs).toEqual([{ openapi: "./openapi.yml", settings: { "title-as-schema-name": false } }]);
    });

    it("lets a spec-level setting win over the root value", () => {
        const result = map({
            specs: [spec({ apiImportSettings: { titleAsSchemaName: true } })],
            apiImportSettings: { titleAsSchemaName: false }
        });
        expect(api(result).specs).toEqual([{ openapi: "./openapi.yml", settings: { "title-as-schema-name": true } }]);
    });

    it("writes root api.settings from root settings plus settings every spec agrees on", () => {
        const result = map({
            specs: [
                spec({ specUrl: "./a.yml", apiImportSettings: { inlineAllOfSchemas: true } }),
                spec({ specUrl: "./b.yml", apiImportSettings: { inlineAllOfSchemas: true } })
            ],
            apiImportSettings: { titleAsSchemaName: false }
        });
        expect(api(result).settings).toEqual({ "title-as-schema-name": false, "inline-all-of-schemas": true });
    });

    it("puts a pathParameterOrder set on the only spec at root", () => {
        const result = map({ specs: [spec({ apiImportSettings: { pathParameterOrder: "spec-order" } })] });
        expect(api(result).settings).toEqual({ "path-parameter-order": "spec-order" });
    });

    it("leaves a setting out of root when two specs disagree", () => {
        const result = map({
            specs: [
                spec({ specUrl: "./a.yml", apiImportSettings: { inlineAllOfSchemas: true } }),
                spec({ specUrl: "./b.yml", apiImportSettings: { inlineAllOfSchemas: false } })
            ]
        });
        expect(api(result).settings).toBeUndefined();
    });

    it("warns when specs set path-parameter-order differently, because Fern reads it only at root", () => {
        const result = map({
            specs: [
                spec({ specUrl: "./a.yml", apiImportSettings: { pathParameterOrder: "spec-order" } }),
                spec({ specUrl: "./b.yml", apiImportSettings: { pathParameterOrder: "url-order" } })
            ]
        });
        expect(api(result).settings).toBeUndefined();
        expect(codes(result.diagnostics)).toEqual([
            "warning CLI_TARGET_ROOT_SETTING_CONFLICT source.specs[0].apiImportSettings.pathParameterOrder",
            "warning CLI_TARGET_ROOT_SETTING_CONFLICT source.specs[1].apiImportSettings.pathParameterOrder"
        ]);
    });

    it("warns when a spec overrides a root path-parameter-order that stays at root", () => {
        const result = map({
            specs: [
                spec({ specUrl: "./a.yml", apiImportSettings: { pathParameterOrder: "spec-order" } }),
                spec({ specUrl: "./b.yml" })
            ],
            apiImportSettings: { pathParameterOrder: "url-order" }
        });
        expect(api(result).settings).toEqual({ "path-parameter-order": "url-order" });
        expect(codes(result.diagnostics)).toEqual([
            "warning CLI_TARGET_ROOT_SETTING_CONFLICT source.specs[0].apiImportSettings.pathParameterOrder"
        ]);
    });

    it("does not warn when every spec agrees with root on path-parameter-order", () => {
        const result = map({
            specs: [spec({ specUrl: "./a.yml" }), spec({ specUrl: "./b.yml" })],
            apiImportSettings: { pathParameterOrder: "spec-order" }
        });
        expect(result.diagnostics).toEqual([]);
    });

    it("maps undiscriminatedUnionsWithLiterals to prefer-undiscriminated-unions-with-literals", () => {
        const result = map({ specs: [spec()], apiImportSettings: { undiscriminatedUnionsWithLiterals: true } });
        expect(api(result).settings).toEqual({ "prefer-undiscriminated-unions-with-literals": true });
    });

    it("returns an error for an asyncapi spec and for a graphql spec", () => {
        expect(errorCodes(map({ specs: [spec({ specType: "asyncapi" })] }).diagnostics)).toEqual([
            "CLI_TARGET_SPEC_TYPE"
        ]);
        expect(errorCodes(map({ specs: [spec({ specType: "graphql" })] }).diagnostics)).toEqual([
            "CLI_TARGET_SPEC_TYPE"
        ]);
    });

    it("returns an error for a URL source", () => {
        const result = map({ specs: [spec({ specUrl: "https://example.com/openapi.yml" })] });
        expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_URL_SOURCE source.specs[0].specUrl"]);
        expect(warningCodes(result.diagnostics)).toEqual([]);
    });
});
