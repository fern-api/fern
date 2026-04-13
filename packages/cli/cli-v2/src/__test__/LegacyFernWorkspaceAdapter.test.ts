import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { LegacyFernWorkspaceAdapter } from "../api/adapter/LegacyFernWorkspaceAdapter.js";
import type { ApiDefinition } from "../api/config/ApiDefinition.js";
import { isConjureSpec } from "../api/config/ConjureSpec.js";
import { isFernSpec } from "../api/config/FernSpec.js";
import type { OpenApiSpec } from "../api/config/OpenApiSpec.js";
import { isOpenApiSpec } from "../api/config/OpenApiSpec.js";
import { FIXTURES_DIR } from "./utils/constants.js";
import { createMockTask } from "./utils/createMockTask.js";
import { createTestContext } from "./utils/createTestContext.js";
import { loadApiDefinition } from "./utils/loadApiDefinition.js";

describe("LegacyFernWorkspaceAdapter", () => {
    describe("Fern Definition Support", () => {
        it("detects Fern spec in API definition", async () => {
            const { apiDefinition } = await loadApiDefinition("fern-definition");
            expect(apiDefinition.specs).toHaveLength(1);

            const spec = apiDefinition.specs[0];
            expect(spec).toBeDefined();
            if (spec != null) {
                expect(isFernSpec(spec)).toBe(true);
            }
        });

        it("adapts Fern spec to FernWorkspace using LazyFernWorkspace", async () => {
            const { cwd, apiDefinition } = await loadApiDefinition("fern-definition");
            const adapter = await createAdapter(cwd);

            const fernWorkspace = await adapter.adapt(apiDefinition);
            expect(fernWorkspace).toBeDefined();
            expect(fernWorkspace.definition).toBeDefined();

            expect(fernWorkspace.definition.rootApiFile).toBeDefined();
            expect(fernWorkspace.definition.rootApiFile.contents.name).toBe("api");
            expect(fernWorkspace.definition.rootApiFile.contents.auth).toBe("bearer");
            expect(fernWorkspace.definition.namedDefinitionFiles).toBeDefined();

            const definitionFileKeys = Object.keys(fernWorkspace.definition.namedDefinitionFiles);
            expect(definitionFileKeys.length).toBeGreaterThan(0);
        });

        it("loads types and services from Fern definition files", async () => {
            const { cwd, apiDefinition } = await loadApiDefinition("fern-definition");
            const adapter = await createAdapter(cwd);

            const fernWorkspace = await adapter.adapt(apiDefinition);
            const definitionFiles = fernWorkspace.definition.namedDefinitionFiles;
            const definitionFileKeys = Object.keys(definitionFiles) as RelativeFilePath[];

            const moviesFileKey = definitionFileKeys.find((key) => key.includes("movies"));
            expect(moviesFileKey).toBeDefined();
            if (moviesFileKey == null) {
                return;
            }

            const moviesFile = definitionFiles[moviesFileKey];
            expect(moviesFile).toBeDefined();

            const types = moviesFile?.contents.types;
            expect(types).toBeDefined();
            expect(types?.MovieId).toBeDefined();
            expect(types?.Movie).toBeDefined();
            expect(types?.CreateMovieRequest).toBeDefined();

            const service = moviesFile?.contents.service;
            expect(service).toBeDefined();
            expect(service?.endpoints).toBeDefined();
        });
    });

    describe("OpenAPI Definition Support", () => {
        it("adapts OpenAPI spec to FernWorkspace using OSSWorkspace", async () => {
            const { cwd, apiDefinition } = await loadApiDefinition("simple-api");
            expect(apiDefinition.specs).toHaveLength(1);

            const firstSpec = apiDefinition.specs[0];
            expect(firstSpec).toBeDefined();
            if (firstSpec != null) {
                expect(isOpenApiSpec(firstSpec)).toBe(true);
            }

            const adapter = await createAdapter(cwd);
            const fernWorkspace = await adapter.adapt(apiDefinition);
            expect(fernWorkspace).toBeDefined();
            expect(fernWorkspace.definition).toBeDefined();
        });
    });

    describe("Conjure Definition Support", () => {
        it("detects Conjure spec in API definition", async () => {
            const { apiDefinition } = await loadApiDefinition("conjure-definition");
            expect(apiDefinition.specs).toHaveLength(1);

            const spec = apiDefinition.specs[0];
            expect(spec).toBeDefined();
            if (spec != null) {
                expect(isConjureSpec(spec)).toBe(true);
            }
        });

        it("adapts Conjure spec to FernWorkspace using ConjureWorkspace", async () => {
            const { cwd, apiDefinition } = await loadApiDefinition("conjure-definition");
            const adapter = await createAdapter(cwd);

            const fernWorkspace = await adapter.adapt(apiDefinition);
            expect(fernWorkspace).toBeDefined();
            expect(fernWorkspace.definition).toBeDefined();
            expect(fernWorkspace.definition.rootApiFile).toBeDefined();
        });

        it("correctly computes relative path from workspace root to conjure directory", async () => {
            const { cwd, apiDefinition } = await loadApiDefinition("conjure-definition");

            const spec = apiDefinition.specs[0];
            expect(spec).toBeDefined();
            if (spec != null && isConjureSpec(spec)) {
                expect(spec.conjure.toString()).toContain("conjure-definition/conjure");
            }

            const adapter = await createAdapter(cwd);
            const fernWorkspace = await adapter.adapt(apiDefinition);
            expect(fernWorkspace).toBeDefined();
            expect(fernWorkspace.absoluteFilePath.toString()).toBe(cwd.toString());
        });
    });

    describe("Multiple OpenAPI Specs", () => {
        it("allows multiple OpenAPI specs to be mixed together", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const adapter = await createAdapter(cwd);

            const openApiSpec1: OpenApiSpec = {
                openapi: AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api", "openapi.yml"))
            };
            const openApiSpec2: OpenApiSpec = {
                openapi: AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api", "openapi.yml"))
            };
            const apiDefinition: ApiDefinition = {
                specs: [openApiSpec1, openApiSpec2]
            };

            // Should not throw - multiple OpenAPI specs are allowed.
            const workspace = await adapter.adapt(apiDefinition);
            expect(workspace).toBeDefined();
        });
    });

    describe("API Configuration Override", () => {
        it("loads auth and authSchemes from fern.yml", async () => {
            const { apiDefinition } = await loadApiDefinition("api-config-override");

            expect(apiDefinition.auth).toBe("BasicAuth");
            expect(apiDefinition.authSchemes).toBeDefined();
            expect(apiDefinition.authSchemes?.BasicAuth).toBeDefined();
        });

        it("load environments from fern.yml", async () => {
            const { apiDefinition } = await loadApiDefinition("api-config-override");

            expect(apiDefinition.defaultEnvironment).toBe("production");
            expect(apiDefinition.environments).toBeDefined();
            expect(apiDefinition.environments?.production).toBeDefined();
            expect(apiDefinition.environments?.staging).toBeDefined();

            const prodEnv = apiDefinition.environments?.production;
            if (typeof prodEnv === "object" && "url" in prodEnv) {
                expect(prodEnv.url).toBe("https://api.production.example.com");
            }
        });

        it("override auth scheme", async () => {
            const { cwd, apiDefinition } = await loadApiDefinition("api-config-override");
            const adapter = await createAdapter(cwd);

            const fernWorkspace = await adapter.adapt(apiDefinition);
            expect(fernWorkspace).toBeDefined();
            expect(fernWorkspace.definition).toBeDefined();

            const rootApiFile = fernWorkspace.definition.rootApiFile;
            expect(rootApiFile).toBeDefined();
            expect(rootApiFile.contents.auth).toBe("BasicAuth");
        });

        it("override environments", async () => {
            const { cwd, apiDefinition } = await loadApiDefinition("api-config-override");
            const adapter = await createAdapter(cwd);

            const fernWorkspace = await adapter.adapt(apiDefinition);
            expect(fernWorkspace).toBeDefined();

            const rootApiFile = fernWorkspace.definition.rootApiFile;
            expect(rootApiFile).toBeDefined();

            const environments = rootApiFile.contents.environments;
            expect(environments).toBeDefined();

            const envKeys = Object.keys(environments ?? {});
            expect(envKeys).toContain("production");
            expect(envKeys).toContain("staging");
        });
    });
});

/**
 * Creates an adapter for testing with the given cwd.
 */
async function createAdapter(cwd: AbsoluteFilePath): Promise<LegacyFernWorkspaceAdapter> {
    const context = await createTestContext({ cwd });
    const task = createMockTask();
    return new LegacyFernWorkspaceAdapter({
        context,
        cliVersion: "0.0.0",
        task
    });
}
