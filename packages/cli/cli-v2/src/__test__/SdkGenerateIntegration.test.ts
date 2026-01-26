import type { OpenAPISpec, ProtobufSpec } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { NOOP_LOGGER } from "@fern-api/logger";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { LegacyApiSpecAdapter } from "../api/adapter/LegacyApiSpecAdapter";
import { isOpenApiSpec } from "../api/config/OpenApiSpec";
import { loadFernYml } from "../config/fern-yml/loadFernYml";
import { WorkspaceLoader } from "../workspace/WorkspaceLoader";
import { createTestContext } from "./utils/createTestContext";

const FIXTURES_DIR = AbsoluteFilePath.of(join(__dirname, "fixtures"));

describe("SDK Generate Integration", () => {
    const logger = NOOP_LOGGER;

    describe("Configuration Settings Flow", () => {
        it("loads OpenAPI settings from fern.yml and passes them through to v1 specs", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "api-with-settings"));
            const fernYml = await loadFernYml({ cwd });
            const loader = new WorkspaceLoader({ cwd, logger });
            const result = await loader.load({ fernYml });

            expect(result.success).toBe(true);
            if (!result.success) {
                return;
            }

            const { workspace } = result;
            const apiDefinition = workspace.apis["api"];
            expect(apiDefinition).toBeDefined();

            const specs = apiDefinition?.specs ?? [];
            expect(specs).toHaveLength(1);

            const spec = specs[0];
            expect(spec).toBeDefined();
            if (spec == null) {
                return;
            }

            expect(isOpenApiSpec(spec)).toBe(true);
            if (!isOpenApiSpec(spec)) {
                return;
            }

            expect(spec.settings).toBeDefined();
            expect(spec.settings?.respectNullableSchemas).toBe(true);
            expect(spec.settings?.coerceEnumsToLiterals).toBe(true);
            expect(spec.settings?.onlyIncludeReferencedSchemas).toBe(true);
            expect(spec.settings?.inlinePathParameters).toBe(false);
            expect(spec.settings?.objectQueryParameters).toBe(true);
            expect(spec.settings?.respectReadonlySchemas).toBe(true);
            expect(spec.settings?.typeDatesAsStrings).toBe(true);
            expect(spec.settings?.defaultIntegerFormat).toBe("int64");
            expect(spec.settings?.pathParameterOrder).toBe("spec-order");

            expect(spec.settings?.exampleGeneration).toBeDefined();
            expect(spec.settings?.exampleGeneration?.request?.maxDepth).toBe(3);
            expect(spec.settings?.exampleGeneration?.response?.maxDepth).toBe(5);

            expect(spec.settings?.filter).toBeDefined();
            expect(spec.settings?.filter?.endpoints).toEqual(["GET /pets", "POST /pets"]);
        });

        it("converts v2 spec settings to v1 ParseOpenAPIOptions correctly", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "api-with-settings"));
            const fernYml = await loadFernYml({ cwd });
            const loader = new WorkspaceLoader({ cwd, logger });
            const result = await loader.load({ fernYml });

            expect(result.success).toBe(true);
            if (!result.success) {
                return;
            }

            const { workspace } = result;
            const apiDefinition = workspace.apis["api"];
            expect(apiDefinition).toBeDefined();

            const adapter = new LegacyApiSpecAdapter({ context: createTestContext({ cwd }) });

            const v1Specs = adapter.convertAll(apiDefinition?.specs ?? []);
            expect(v1Specs).toHaveLength(1);

            const v1Spec = v1Specs[0] as OpenAPISpec | undefined;
            expect(v1Spec).toBeDefined();
            if (v1Spec == null) {
                return;
            }

            const settings = v1Spec.settings;
            expect(settings).toBeDefined();

            // Base settings.
            expect(settings?.respectNullableSchemas).toBe(true);
            expect(settings?.coerceEnumsToLiterals).toBe(true);

            // OpenAPI-specific settings.
            expect(settings?.onlyIncludeReferencedSchemas).toBe(true);
            expect(settings?.inlinePathParameters).toBe(false);
            expect(settings?.objectQueryParameters).toBe(true);
            expect(settings?.respectReadonlySchemas).toBe(true);
            expect(settings?.typeDatesAsStrings).toBe(true);

            // Enum conversions.
            expect(settings?.defaultIntegerFormat).toBe(generatorsYml.DefaultIntegerFormat.Int64);
            expect(settings?.pathParameterOrder).toBe(generatorsYml.PathParameterOrder.SpecOrder);

            // Example generation (camelCase -> kebab-case).
            expect(settings?.exampleGeneration).toEqual({
                request: { "max-depth": 3 },
                response: { "max-depth": 5 }
            });

            expect(settings?.filter).toEqual({
                endpoints: ["GET /pets", "POST /pets"]
            });
        });

        it("creates OSSWorkspace with settings propagated from specs", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "api-with-settings"));
            const fernYml = await loadFernYml({ cwd });
            const loader = new WorkspaceLoader({ cwd, logger });
            const result = await loader.load({ fernYml });

            expect(result.success).toBe(true);
            if (!result.success) {
                return;
            }

            const { workspace } = result;
            const apiDefinition = workspace.apis["api"];
            expect(apiDefinition).toBeDefined();

            const adapter = new LegacyApiSpecAdapter({ context: createTestContext({ cwd }) });

            const v1Specs = adapter.convertAll(apiDefinition?.specs ?? []);
            const filteredSpecs = v1Specs.filter((spec): spec is OpenAPISpec | ProtobufSpec => {
                if (spec.type === "openrpc") {
                    return false;
                }
                if (spec.type === "protobuf" && !spec.fromOpenAPI) {
                    return false;
                }
                return true;
            });

            const ossWorkspace = new OSSWorkspace({
                specs: filteredSpecs,
                allSpecs: v1Specs,
                absoluteFilePath: cwd,
                workspaceName: undefined,
                generatorsConfiguration: undefined,
                cliVersion: "0.0.0",
                changelog: undefined
            });

            expect(ossWorkspace.respectNullableSchemas).toBe(true);
            expect(ossWorkspace.coerceEnumsToLiterals).toBe(true);
            expect(ossWorkspace.onlyIncludeReferencedSchemas).toBe(true);
            expect(ossWorkspace.inlinePathParameters).toBe(false);
            expect(ossWorkspace.objectQueryParameters).toBe(true);
            expect(ossWorkspace.respectReadonlySchemas).toBe(true);
            expect(ossWorkspace.defaultIntegerFormat).toBe(generatorsYml.DefaultIntegerFormat.Int64);
            expect(ossWorkspace.pathParameterOrder).toBe(generatorsYml.PathParameterOrder.SpecOrder);
        });
    });

    describe("Simple API without settings", () => {
        it("loads workspace without settings and uses defaults", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const fernYml = await loadFernYml({ cwd });
            const loader = new WorkspaceLoader({ cwd, logger });
            const result = await loader.load({ fernYml });

            expect(result.success).toBe(true);
            if (!result.success) {
                return;
            }

            const { workspace } = result;
            expect(workspace.apis["api"]).toBeDefined();

            const adapter = new LegacyApiSpecAdapter({ context: createTestContext({ cwd }) });

            const v1Specs = adapter.convertAll(workspace.apis["api"]?.specs ?? []);
            expect(v1Specs).toHaveLength(1);

            const v1Spec = v1Specs[0] as OpenAPISpec | undefined;
            expect(v1Spec?.settings).toBeUndefined();
        });
    });

    describe("Target Configuration", () => {
        it("loads SDK targets from fern.yml", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const fernYml = await loadFernYml({ cwd });
            const loader = new WorkspaceLoader({ cwd, logger });
            const result = await loader.load({ fernYml });

            expect(result.success).toBe(true);
            if (!result.success) {
                return;
            }

            const { workspace } = result;
            const sdks = workspace.sdks;

            expect(sdks).toBeDefined();
            expect(sdks?.org).toBe("test-org");
            expect(sdks?.defaultGroup).toBe("local");
            expect(sdks?.targets).toHaveLength(2);

            const tsTarget = sdks?.targets.find((t) => t.name === "typescript");
            expect(tsTarget).toBeDefined();
            expect(tsTarget?.lang).toBe("typescript");
            expect(tsTarget?.version).toBe("0.39.3");
            expect(tsTarget?.image).toBe("fernapi/fern-typescript-sdk");
            expect(tsTarget?.output.path).toBe("./generated/typescript");

            const pyTarget = sdks?.targets.find((t) => t.name === "python");
            expect(pyTarget).toBeDefined();
            expect(pyTarget?.lang).toBe("python");
            expect(pyTarget?.version).toBe("4.3.10");
            expect(pyTarget?.image).toBe("fernapi/fern-python-sdk");
        });

        it("filters targets by group", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const fernYml = await loadFernYml({ cwd });
            const loader = new WorkspaceLoader({ cwd, logger });
            const result = await loader.load({ fernYml });

            expect(result.success).toBe(true);
            if (!result.success) {
                return;
            }

            const { workspace } = result;
            const sdks = workspace.sdks;
            expect(sdks).toBeDefined();

            const localTargets = sdks?.targets.filter((t) => t.groups?.includes("local"));
            expect(localTargets).toHaveLength(2);
        });
    });

    describe("API Definition Resolution", () => {
        it("resolves API definition for target", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const fernYml = await loadFernYml({ cwd });
            const loader = new WorkspaceLoader({ cwd, logger });
            const result = await loader.load({ fernYml });

            expect(result.success).toBe(true);
            if (!result.success) {
                return;
            }

            const { workspace } = result;
            const target = workspace.sdks?.targets[0];
            expect(target).toBeDefined();

            expect(target?.api).toBe("api");

            const apiDef = workspace.apis[target?.api ?? ""];
            expect(apiDef).toBeDefined();
            expect(apiDef?.specs).toHaveLength(1);
        });
    });
});
