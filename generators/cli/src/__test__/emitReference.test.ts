import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SPECS_MANIFEST_FILENAME } from "../copySpecs.js";
import type { DetectedAuthBinding } from "../detectAuth.js";
import { emitReference } from "../emitReference.js";

describe("emitReference", () => {
    let tmpDir: string;
    let outputDir: string;
    let specsDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "emitReference-"));
        outputDir = path.join(tmpDir, "out");
        specsDir = path.join(tmpDir, "specs");
        await mkdir(outputDir, { recursive: true });
        await mkdir(specsDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function writeSpec(filename: string, spec: object): Promise<string> {
        const specPath = path.join(specsDir, filename);
        await writeFile(specPath, JSON.stringify(spec));
        return specPath;
    }

    async function writeManifest(specs: Array<{ type: string; specPath: string; namespace?: string }>): Promise<void> {
        await writeFile(path.join(specsDir, SPECS_MANIFEST_FILENAME), JSON.stringify({ specs }));
    }

    async function emitAndRead(args: Parameters<typeof emitReference>[0]): Promise<string> {
        await emitReference(args);
        return readFile(path.join(args.outputDir, "reference.md"), "utf-8");
    }

    // ── Fixtures ────────────────────────────────────────────────────

    const bearerBinding: DetectedAuthBinding = {
        schemeName: "BearerAuth",
        rustCall: '.auth(BearerAuth::new("BearerAuth").env("PETSTORE_API_TOKEN"))',
        placement: "root",
        authTypeImport: "BearerAuth",
        envVars: ["PETSTORE_API_TOKEN"],
        kind: "bearer"
    };

    const minimalSpec = {
        openapi: "3.0.0",
        info: { title: "Petstore", version: "1.0.0" },
        paths: {
            "/pets": {
                get: {
                    operationId: "pets_list",
                    tags: ["Pets"],
                    summary: "List all pets",
                    parameters: [
                        {
                            name: "limit",
                            in: "query",
                            required: false,
                            description: "Maximum number of pets to return",
                            schema: { type: "integer" }
                        }
                    ],
                    responses: { "200": { description: "A list of pets" } }
                },
                post: {
                    operationId: "pets_create",
                    tags: ["Pets"],
                    summary: "Create a pet",
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { type: "object" } } }
                    },
                    responses: { "201": { description: "Pet created" } }
                }
            },
            "/pets/{petId}": {
                get: {
                    operationId: "pets_get",
                    tags: ["Pets"],
                    description: "Get a specific pet by ID",
                    parameters: [
                        {
                            name: "petId",
                            in: "path",
                            required: true,
                            description: "The pet ID",
                            schema: { type: "string" }
                        }
                    ],
                    responses: { "200": { description: "A pet" } }
                }
            }
        }
    };

    // ── Basic generation ─────────────────────────────────────────────

    it("generates a reference.md with resources and methods", async () => {
        const specPath = await writeSpec("openapi0.json", minimalSpec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "petstore",
            apiDisplayName: "Petstore",
            authBindings: [bearerBinding],
            specsDir
        });

        expect(reference).toContain("# Petstore CLI Reference");
        expect(reference).toContain("Full command reference for `petstore`.");
        expect(reference).toContain("`petstore pets`");
        expect(reference).toContain("`petstore pets list`");
        expect(reference).toContain("`petstore pets create`");
        expect(reference).toContain("`petstore pets get`");
        expect(reference).toContain("List all pets");
        expect(reference).toContain("Create a pet");
        expect(reference).toContain("Get a specific pet by ID");
        expect(reference).toContain("`GET /pets`");
        expect(reference).toContain("`POST /pets`");
        expect(reference).toContain("`GET /pets/{petId}`");
        expect(reference).toContain("`--limit`");
        expect(reference).toContain("`--pet-id`");
        expect(reference).toContain("## Global flags");
    });

    // ── Tag prefix stripping ─────────────────────────────────────────

    it("strips tag prefix from operationId", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "API", version: "1.0.0" },
            paths: {
                "/customers": {
                    get: {
                        operationId: "customersList",
                        tags: ["Customers"],
                        responses: { "200": { description: "ok" } }
                    }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "my-api",
            apiDisplayName: "My API",
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("`my-api customers list`");
    });

    // ── x-fern-sdk-group-name and x-fern-sdk-method-name ─────────────

    it("respects x-fern-sdk-group-name and x-fern-sdk-method-name", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "API", version: "1.0.0" },
            paths: {
                "/movies/create-movie": {
                    post: {
                        operationId: "imdb_createMovie",
                        tags: ["Imdb"],
                        description: "Add a movie to the database",
                        "x-fern-sdk-group-name": ["imdb"],
                        "x-fern-sdk-method-name": "createMovie",
                        requestBody: { required: true, content: { "application/json": {} } },
                        responses: { "201": { description: "Created" } }
                    }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "api",
            apiDisplayName: "api",
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("`api imdb`");
        expect(reference).toContain("`api imdb create-movie`");
        expect(reference).toContain("Add a movie to the database");
    });

    // ── No-op when no specs ──────────────────────────────────────────

    it("is a no-op when no specs are mounted", async () => {
        await emitReference({
            outputDir,
            binaryName: "my-api",
            apiDisplayName: "My API",
            authBindings: [],
            specsDir
        });

        // No reference.md should be written
        await expect(readFile(path.join(outputDir, "reference.md"), "utf-8")).rejects.toThrow();
    });

    // ── Availability badges ──────────────────────────────────────────

    it("renders availability badges", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "API", version: "1.0.0" },
            paths: {
                "/beta-endpoint": {
                    get: {
                        operationId: "getBeta",
                        tags: ["Beta"],
                        "x-fern-availability": "beta",
                        responses: { "200": { description: "ok" } }
                    }
                },
                "/deprecated-endpoint": {
                    get: {
                        operationId: "getOld",
                        tags: ["Legacy"],
                        deprecated: true,
                        responses: { "200": { description: "ok" } }
                    }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "my-api",
            apiDisplayName: "My API",
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("`[BETA]`");
        expect(reference).toContain("`[DEPRECATED]`");
    });

    // ── x-fern-ignore operations are skipped ─────────────────────────

    it("skips operations with x-fern-ignore", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "API", version: "1.0.0" },
            paths: {
                "/visible": {
                    get: {
                        operationId: "getVisible",
                        tags: ["Things"],
                        responses: { "200": { description: "ok" } }
                    }
                },
                "/hidden": {
                    get: {
                        operationId: "getHidden",
                        tags: ["Things"],
                        "x-fern-ignore": true,
                        responses: { "200": { description: "ok" } }
                    }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "my-api",
            apiDisplayName: "My API",
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("get-visible");
        expect(reference).not.toContain("get-hidden");
    });

    // ── Namespace support ────────────────────────────────────────────

    it("prepends namespace to resource names when present", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "API", version: "1.0.0" },
            paths: {
                "/items": {
                    get: {
                        operationId: "items_list",
                        tags: ["Items"],
                        responses: { "200": { description: "ok" } }
                    }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath, namespace: "store" }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "my-api",
            apiDisplayName: "My API",
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("`my-api store items`");
    });

    // ── Fallback to binaryName when no apiDisplayName ────────────────

    it("falls back to binaryName in header when apiDisplayName is undefined", async () => {
        const specPath = await writeSpec("openapi0.json", minimalSpec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "my-tool",
            apiDisplayName: undefined,
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("# my-tool CLI Reference");
    });
});
