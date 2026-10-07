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

    // ── $ref parameter resolution ───────────────────────────────────

    it("resolves $ref parameters from components.parameters", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "Close API", version: "1.0.0" },
            paths: {
                "/activity/": {
                    get: {
                        operationId: "activity_list",
                        tags: ["Activity"],
                        summary: "List activities",
                        parameters: [
                            { $ref: "#/components/parameters/LimitParam" },
                            { $ref: "#/components/parameters/SkipParam" },
                            { $ref: "#/components/parameters/FieldsParam" }
                        ],
                        responses: { "200": { description: "ok" } }
                    }
                }
            },
            components: {
                parameters: {
                    LimitParam: {
                        in: "query",
                        name: "_limit",
                        required: false,
                        schema: { type: "integer", default: 100 }
                    },
                    SkipParam: {
                        in: "query",
                        name: "_skip",
                        required: false,
                        schema: { type: "integer", default: 0 }
                    },
                    FieldsParam: {
                        description: "Comma-separated list of fields to include in the response.",
                        in: "query",
                        name: "_fields",
                        required: false,
                        schema: { type: "string" }
                    }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "close",
            apiDisplayName: "Close API",
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("`--limit`");
        expect(reference).toContain("`--skip`");
        expect(reference).toContain("`--fields`");
        expect(reference).toContain("Comma-separated list of fields");
    });

    it("resolves path-level $ref parameters", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "API", version: "1.0.0" },
            paths: {
                "/items/{itemId}": {
                    parameters: [{ $ref: "#/components/parameters/ItemIdParam" }],
                    get: {
                        operationId: "items_get",
                        tags: ["Items"],
                        responses: { "200": { description: "ok" } }
                    }
                }
            },
            components: {
                parameters: {
                    ItemIdParam: {
                        in: "path",
                        name: "itemId",
                        required: true,
                        schema: { type: "string" }
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

        expect(reference).toContain("`--item-id`");
    });

    it("skips unresolvable $ref parameters gracefully", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "API", version: "1.0.0" },
            paths: {
                "/things": {
                    get: {
                        operationId: "things_list",
                        tags: ["Things"],
                        parameters: [
                            { $ref: "#/components/parameters/DoesNotExist" },
                            { name: "status", in: "query", schema: { type: "string" } }
                        ],
                        responses: { "200": { description: "ok" } }
                    }
                }
            },
            components: { parameters: {} }
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

        // The inline param should still appear; the bad $ref is silently dropped.
        expect(reference).toContain("`--status`");
        expect(reference).not.toContain("DoesNotExist");
    });

    it("handles mixed inline and $ref parameters in the same operation", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "API", version: "1.0.0" },
            paths: {
                "/search": {
                    get: {
                        operationId: "search",
                        tags: ["Search"],
                        parameters: [
                            { name: "q", in: "query", required: true, schema: { type: "string" } },
                            { $ref: "#/components/parameters/LimitParam" },
                            { name: "sort", in: "query", schema: { type: "string" } }
                        ],
                        responses: { "200": { description: "ok" } }
                    }
                }
            },
            components: {
                parameters: {
                    LimitParam: {
                        in: "query",
                        name: "_limit",
                        required: false,
                        schema: { type: "integer" }
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

        expect(reference).toContain("`--q`");
        expect(reference).toContain("`--limit`");
        expect(reference).toContain("`--sort`");
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
    // ── Parity with the runtime's command model ──────────────────────

    it("omits OPTIONS and HEAD operations, which the runtime has no command for", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "Pets", version: "1.0.0" },
            paths: {
                "/pets": {
                    get: { operationId: "pets_list", tags: ["Pets"], responses: { "200": { description: "OK" } } },
                    options: {
                        operationId: "pets_preflight",
                        tags: ["Pets"],
                        responses: { "204": { description: "" } }
                    },
                    head: { operationId: "pets_head", tags: ["Pets"], responses: { "200": { description: "" } } }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "pets",
            apiDisplayName: undefined,
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("`pets pets list`");
        expect(reference).not.toContain("preflight");
        expect(reference).not.toContain("pets pets head");
    });

    it("hoists a group named like its namespace and nests `/` namespaces", async () => {
        const spec = (tag: string) => ({
            openapi: "3.0.0",
            info: { title: "Api", version: "1.0.0" },
            paths: {
                "/items": { get: { operationId: "list", tags: [tag], responses: { "200": { description: "OK" } } } }
            }
        });
        const emailPath = await writeSpec("email.json", spec("Email"));
        const bulkPath = await writeSpec("bulk.json", spec("BulkMessages"));
        await writeManifest([
            { type: "openapi", specPath: emailPath, namespace: "email" },
            { type: "openapi", specPath: bulkPath, namespace: "messaging/sub" }
        ]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "acme",
            apiDisplayName: undefined,
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("`acme email list`");
        expect(reference).not.toContain("acme email email");
        expect(reference).toContain("`acme messaging sub bulk-messages list`");
    });

    it("lists one flag per request-body field, with the runtime's names and required markers", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "Msgs", version: "1.0.0" },
            components: {
                schemas: {
                    Address: {
                        type: "object",
                        required: ["street"],
                        properties: { street: { type: "string" }, zipCode: { type: "string" } }
                    },
                    CreateMessage: {
                        type: "object",
                        required: ["To"],
                        properties: {
                            To: { type: "string", description: "Recipient." },
                            messagingServiceSID: { type: "string" },
                            id: { type: "string", readOnly: true },
                            query: { type: "string" },
                            address: { $ref: "#/components/schemas/Address" }
                        }
                    }
                }
            },
            paths: {
                "/messages": {
                    post: {
                        operationId: "messages_send",
                        tags: ["Messages"],
                        requestBody: {
                            required: true,
                            content: {
                                "application/x-www-form-urlencoded": {
                                    schema: { $ref: "#/components/schemas/CreateMessage" }
                                }
                            }
                        },
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "msgs",
            apiDisplayName: undefined,
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("| `--to` | `string` | Yes | Recipient. |");
        expect(reference).toContain("| `--messaging-service-s-i-d` | `string` | No |");
        expect(reference).toContain("| `--query-param` | `string` | No |");
        expect(reference).toContain("| `--address` | `JSON` | No |");
        expect(reference).toContain("| `--address.street` | `string` | Yes |");
        expect(reference).toContain("| `--address.zip-code` | `string` | No |");
        expect(reference).not.toContain("`--id`");
        // Body fields can satisfy the body, so `--json` itself is optional.
        expect(reference).toContain("| `--json` | `JSON` | No |");
    });

    it("uses x-fern-parameter-name and the runtime's sanitizing for parameter flags", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "Msgs", version: "1.0.0" },
            paths: {
                "/messages": {
                    get: {
                        operationId: "messages_list",
                        tags: ["Messages"],
                        parameters: [
                            {
                                name: "DateSent<",
                                in: "query",
                                "x-fern-parameter-name": "DateSentBefore",
                                schema: { type: "string" }
                            },
                            { name: "Page[Size]", in: "query", schema: { type: "integer" } }
                        ],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "msgs",
            apiDisplayName: undefined,
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("`--date-sent-before`");
        expect(reference).toContain("`--page-size`");
    });

    it("renders Markdown headings inside descriptions as bold text", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "Docs", version: "1.0.0" },
            paths: {
                "/things": {
                    get: {
                        operationId: "things_list",
                        tags: ["Things"],
                        description: "Lists things.\n\n## Rate limits\n\nTen per second.",
                        parameters: [
                            {
                                name: "filter",
                                in: "query",
                                description: "## Syntax\nA filter\nexpression.",
                                schema: { type: "string" }
                            }
                        ],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const specPath = await writeSpec("openapi0.json", spec);
        await writeManifest([{ type: "openapi", specPath }]);

        const reference = await emitAndRead({
            outputDir,
            binaryName: "docs",
            apiDisplayName: undefined,
            authBindings: [],
            specsDir
        });

        expect(reference).toContain("**Rate limits**");
        expect(reference).not.toMatch(/^## Rate limits/m);
        expect(reference).toContain("| `--filter` | `string` | No | Syntax A filter expression. |");
    });
});
