import { applyOpenAPIOverlay, mergeWithOverrides } from "@fern-api/core-utils";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateOverlay, generateOverrides, toOverlay } from "../split/diffSpecs.js";
import { serializeSpec } from "../utils/loadSpec.js";

/**
 * Tests that `merge` and `split` are clean inverses of one another.
 *
 * The core invariants:
 * 1. merge(base, overrides) → merged spec. split(base, merged) → same overrides.
 * 2. split(base, modified) → overrides. merge(base, overrides) → same modified spec.
 * 3. merge then immediately split (without edits) recovers the original overrides.
 * 4. split then immediately merge recovers the modified spec.
 */

// biome-ignore lint/suspicious/noExplicitAny: test data
type Spec = Record<string, any>;

let testDir: string;

beforeEach(async () => {
    testDir = path.join(tmpdir(), `fern-inverse-test-${randomUUID()}`);
    await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
});

/** Simulates `fern api overrides merge` */
function merge(base: Spec, overrides: Spec): Spec {
    return mergeWithOverrides({ data: structuredClone(base), overrides });
}

/** Simulates `fern api overrides split` */
function split(original: Spec, modified: Spec): { restored: Spec; overrides: Spec } {
    const overrides = generateOverrides(original, modified);
    return { restored: structuredClone(original), overrides };
}

/** Round-trip through YAML to ensure serialization doesn't alter data */
function yamlRoundTrip(data: Spec): Spec {
    return yaml.load(yaml.dump(data, { lineWidth: -1, noRefs: true })) as Spec;
}

const baseSpec: Spec = {
    openapi: "3.0.0",
    info: { title: "Pet Store", version: "1.0.0", description: "A sample API" },
    paths: {
        "/pets": {
            get: {
                operationId: "listPets",
                summary: "List all pets",
                parameters: [{ name: "limit", in: "query", schema: { type: "integer" } }],
                responses: {
                    "200": {
                        description: "A list of pets",
                        content: {
                            "application/json": {
                                schema: { type: "array", items: { $ref: "#/components/schemas/Pet" } }
                            }
                        }
                    }
                }
            },
            post: {
                operationId: "createPet",
                summary: "Create a pet",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Pet" }
                        }
                    }
                },
                responses: {
                    "201": { description: "Created" }
                }
            }
        },
        "/pets/{petId}": {
            get: {
                operationId: "getPet",
                summary: "Get a pet by ID",
                parameters: [{ name: "petId", in: "path", required: true, schema: { type: "string" } }],
                responses: {
                    "200": { description: "A pet" }
                }
            }
        }
    },
    components: {
        schemas: {
            Pet: {
                type: "object",
                required: ["id", "name"],
                properties: {
                    id: { type: "integer", format: "int64" },
                    name: { type: "string" },
                    tag: { type: "string" }
                }
            },
            Error: {
                type: "object",
                properties: {
                    code: { type: "integer" },
                    message: { type: "string" }
                }
            }
        }
    }
};

const sampleOverrides: Spec = {
    paths: {
        "/pets": {
            get: {
                "x-fern-sdk-group-name": "pets",
                "x-fern-sdk-method-name": "list"
            },
            post: {
                "x-fern-sdk-group-name": "pets",
                "x-fern-sdk-method-name": "create"
            }
        },
        "/pets/{petId}": {
            get: {
                "x-fern-sdk-group-name": "pets",
                "x-fern-sdk-method-name": "get"
            }
        }
    },
    components: {
        schemas: {
            Pet: {
                properties: {
                    breed: { type: "string", description: "The breed of the pet" }
                }
            }
        }
    }
};

describe("merge and split are inverses", () => {
    it("merge then split recovers the original overrides", () => {
        // Start: base + overrides
        // Step 1: merge → merged spec
        const merged = merge(baseSpec, sampleOverrides);

        // Step 2: split(base, merged) → should recover sampleOverrides
        const { overrides } = split(baseSpec, merged);

        expect(overrides).toEqual(sampleOverrides);
    });

    it("split then merge recovers the modified spec", () => {
        // Start: modified spec (base + edits)
        const modified = structuredClone(baseSpec);
        modified.paths["/pets"].get["x-fern-sdk-group-name"] = "pets";
        modified.paths["/pets"].get["x-fern-sdk-method-name"] = "list";
        modified.info.description = "An updated API";

        // Step 1: split(base, modified) → overrides
        const { restored, overrides } = split(baseSpec, modified);

        // Restored should equal base
        expect(restored).toEqual(baseSpec);

        // Step 2: merge(base, overrides) → should recover modified
        const remerged = merge(baseSpec, overrides);
        expect(remerged).toEqual(modified);
    });

    it("merge then split then merge is idempotent", () => {
        const merged1 = merge(baseSpec, sampleOverrides);
        const { overrides } = split(baseSpec, merged1);
        const merged2 = merge(baseSpec, overrides);

        expect(merged2).toEqual(merged1);
    });

    it("handles empty overrides as no-op", () => {
        const merged = merge(baseSpec, {});
        expect(merged).toEqual(baseSpec);

        const { overrides } = split(baseSpec, merged);
        expect(Object.keys(overrides)).toHaveLength(0);
    });

    it("round-trips through YAML serialization", () => {
        // Simulate the full file-based workflow
        const base = yamlRoundTrip(baseSpec);
        const over = yamlRoundTrip(sampleOverrides);

        // merge
        const merged = yamlRoundTrip(merge(base, over));

        // split
        const { overrides } = split(base, merged);
        const roundTrippedOverrides = yamlRoundTrip(overrides);

        expect(roundTrippedOverrides).toEqual(over);
    });

    it("handles multiple sequential overrides merge then split", () => {
        const overrides1: Spec = {
            paths: {
                "/pets": {
                    get: { "x-fern-sdk-group-name": "pets" }
                }
            }
        };
        const overrides2: Spec = {
            paths: {
                "/pets": {
                    get: { "x-fern-sdk-method-name": "list" }
                }
            }
        };

        // Merge sequentially
        let merged = merge(baseSpec, overrides1);
        merged = merge(merged, overrides2);

        // Split should capture all changes from both overrides
        const { overrides } = split(baseSpec, merged);

        expect(overrides.paths["/pets"].get["x-fern-sdk-group-name"]).toBe("pets");
        expect(overrides.paths["/pets"].get["x-fern-sdk-method-name"]).toBe("list");
    });

    it("handles adding new top-level sections", () => {
        const overridesWithServers: Spec = {
            servers: [{ url: "https://api.example.com" }]
        };

        const merged = merge(baseSpec, overridesWithServers);
        expect(merged.servers).toBeDefined();

        const { overrides } = split(baseSpec, merged);
        expect(overrides.servers).toEqual([{ url: "https://api.example.com" }]);

        // Re-merge recovers
        const remerged = merge(baseSpec, overrides);
        expect(remerged).toEqual(merged);
    });

    it("handles adding entirely new paths", () => {
        const overridesWithNewPath: Spec = {
            paths: {
                "/owners": {
                    get: {
                        operationId: "listOwners",
                        summary: "List all owners"
                    }
                }
            }
        };

        const merged = merge(baseSpec, overridesWithNewPath);
        const { overrides } = split(baseSpec, merged);

        expect(overrides.paths["/owners"]).toBeDefined();
        expect(overrides.paths["/pets"]).toBeUndefined();

        const remerged = merge(baseSpec, overrides);
        expect(remerged).toEqual(merged);
    });

    it("handles modifying scalar values", () => {
        const overridesWithScalar: Spec = {
            info: { title: "Updated Pet Store" }
        };

        const merged = merge(baseSpec, overridesWithScalar);
        expect(merged.info.title).toBe("Updated Pet Store");
        expect(merged.info.version).toBe("1.0.0");

        const { overrides } = split(baseSpec, merged);
        expect(overrides.info.title).toBe("Updated Pet Store");

        const remerged = merge(baseSpec, overrides);
        expect(remerged).toEqual(merged);
    });

    it("performs full file-based workflow", async () => {
        // Write base spec and overrides to files
        const specPath = path.join(testDir, "openapi.yml");
        const overridesPath = path.join(testDir, "openapi-overrides.yml");

        await writeFile(specPath, yaml.dump(baseSpec, { lineWidth: -1, noRefs: true }));
        await writeFile(overridesPath, yaml.dump(sampleOverrides, { lineWidth: -1, noRefs: true }));

        // Step 1: Simulate merge — read files, merge, write back
        const base = yaml.load(await readFile(specPath, "utf8")) as Spec;
        const overridesFromFile = yaml.load(await readFile(overridesPath, "utf8")) as Spec;
        const merged = mergeWithOverrides({ data: base, overrides: overridesFromFile });
        await writeFile(specPath, yaml.dump(merged, { lineWidth: -1, noRefs: true }));

        // Verify merged content
        const mergedFromFile = yaml.load(await readFile(specPath, "utf8")) as Spec;
        expect(mergedFromFile.paths["/pets"].get["x-fern-sdk-group-name"]).toBe("pets");

        // Step 2: Simulate split — compare merged with original base, extract overrides
        const originalBase = yaml.load(yaml.dump(baseSpec, { lineWidth: -1, noRefs: true })) as Spec;
        const extractedOverrides = generateOverrides(originalBase, mergedFromFile);

        // Write overrides and restore spec
        await writeFile(overridesPath, yaml.dump(extractedOverrides, { lineWidth: -1, noRefs: true }));
        await writeFile(specPath, yaml.dump(originalBase, { lineWidth: -1, noRefs: true }));

        // Verify: spec restored to original
        const restoredSpec = yaml.load(await readFile(specPath, "utf8")) as Spec;
        expect(restoredSpec).toEqual(originalBase);

        // Verify: extracted overrides match original
        const restoredOverrides = yaml.load(await readFile(overridesPath, "utf8")) as Spec;
        expect(restoredOverrides).toEqual(yaml.load(yaml.dump(sampleOverrides, { lineWidth: -1, noRefs: true })));

        // Step 3: Re-merge to verify full round-trip
        const base2 = yaml.load(await readFile(specPath, "utf8")) as Spec;
        const over2 = yaml.load(await readFile(overridesPath, "utf8")) as Spec;
        const remerged = mergeWithOverrides({ data: base2, overrides: over2 });
        expect(remerged).toEqual(mergedFromFile);
    });

    it("preserves JSON format for .json spec files through merge and split", async () => {
        const specPath = path.join(testDir, "openapi.json");
        const overridesPath = path.join(testDir, "openapi-overrides.yml");

        // Write base spec as JSON, overrides as YAML
        await writeFile(specPath, JSON.stringify(baseSpec, null, 2) + "\n");
        await writeFile(overridesPath, yaml.dump(sampleOverrides, { lineWidth: -1, noRefs: true }));

        // Simulate merge: read, merge, write back using serializeSpec
        const base = JSON.parse(await readFile(specPath, "utf8")) as Spec;
        const over = yaml.load(await readFile(overridesPath, "utf8")) as Spec;
        const merged = mergeWithOverrides({ data: base, overrides: over });
        await writeFile(specPath, serializeSpec(merged, specPath));

        // Verify the file is still valid JSON (not YAML)
        const mergedRaw = await readFile(specPath, "utf8");
        const mergedParsed = JSON.parse(mergedRaw);
        expect(mergedParsed.paths["/pets"].get["x-fern-sdk-group-name"]).toBe("pets");

        // Simulate split: extract overrides, restore spec as JSON
        const originalBase = JSON.parse(JSON.stringify(baseSpec)) as Spec;
        const extractedOverrides = generateOverrides(originalBase, mergedParsed);
        await writeFile(specPath, serializeSpec(originalBase, specPath));
        await writeFile(overridesPath, yaml.dump(extractedOverrides, { lineWidth: -1, noRefs: true }));

        // Verify spec is valid JSON after restore
        const restoredRaw = await readFile(specPath, "utf8");
        const restoredSpec = JSON.parse(restoredRaw);
        expect(restoredSpec).toEqual(originalBase);

        // Verify overrides is YAML (not JSON)
        const overridesRaw = await readFile(overridesPath, "utf8");
        expect(() => yaml.load(overridesRaw)).not.toThrow();
    });

    it("writes YAML spec files as YAML through merge", async () => {
        const specPath = path.join(testDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(baseSpec, { lineWidth: -1, noRefs: true }));

        const base = yaml.load(await readFile(specPath, "utf8")) as Spec;
        const merged = mergeWithOverrides({ data: base, overrides: sampleOverrides });
        await writeFile(specPath, serializeSpec(merged, specPath));

        // Verify the file is YAML (not JSON — should fail to parse as strict JSON)
        const raw = await readFile(specPath, "utf8");
        expect(() => JSON.parse(raw)).toThrow();
        const parsed = yaml.load(raw) as Spec;
        expect(parsed.paths["/pets"].get["x-fern-sdk-group-name"]).toBe("pets");
    });
});

/** Simulates `fern api merge` with overlays */
function mergeOverlay(base: Spec, overlayDoc: ReturnType<typeof generateOverlay>): Spec {
    return applyOpenAPIOverlay({
        data: structuredClone(base),
        overlay: toOverlay(overlayDoc)
    });
}

/** Simulates `fern api split --format overlays` */
function splitOverlay(original: Spec, modified: Spec): { restored: Spec; overlay: ReturnType<typeof generateOverlay> } {
    const overlay = generateOverlay(original, modified);
    return { restored: structuredClone(original), overlay };
}

describe("merge and split are inverses (overlay format)", () => {
    it("split as overlay then merge recovers the modified spec", () => {
        const modified = structuredClone(baseSpec);
        modified.paths["/pets"].get["x-fern-sdk-group-name"] = "pets";
        modified.paths["/pets"].get["x-fern-sdk-method-name"] = "list";
        modified.info.description = "An updated API";

        const { restored, overlay } = splitOverlay(baseSpec, modified);

        // Restored should equal base
        expect(restored).toEqual(baseSpec);

        // Merge overlay into base should recover modified
        const remerged = mergeOverlay(baseSpec, overlay);
        expect(remerged).toEqual(modified);
    });

    it("merge overlay then split recovers the overlay actions' effect", () => {
        // Start with a known overlay
        const overlay = generateOverlay(baseSpec, merge(baseSpec, sampleOverrides));

        // Merge overlay into base
        const merged = mergeOverlay(baseSpec, overlay);

        // Split should produce an overlay that has the same effect
        const { overlay: recoveredOverlay } = splitOverlay(baseSpec, merged);
        const remerged = mergeOverlay(baseSpec, recoveredOverlay);
        expect(remerged).toEqual(merged);
    });

    it("overlay merge then split then merge is idempotent", () => {
        const modified = structuredClone(baseSpec);
        modified.paths["/pets"].get["x-fern-sdk-group-name"] = "pets";
        modified.components.schemas.Pet.properties.breed = { type: "string" };

        const merged1 = mergeOverlay(baseSpec, generateOverlay(baseSpec, modified));
        const { overlay } = splitOverlay(baseSpec, merged1);
        const merged2 = mergeOverlay(baseSpec, overlay);

        expect(merged2).toEqual(merged1);
    });

    it("handles empty overlay as no-op", () => {
        const overlay = generateOverlay(baseSpec, structuredClone(baseSpec));
        expect(overlay.actions).toHaveLength(0);

        const merged = mergeOverlay(baseSpec, overlay);
        expect(merged).toEqual(baseSpec);
    });

    it("handles adding entirely new paths via overlay", () => {
        const modified = structuredClone(baseSpec);
        modified.paths["/owners"] = {
            get: { operationId: "listOwners", summary: "List all owners" }
        };

        const overlay = generateOverlay(baseSpec, modified);
        const merged = mergeOverlay(baseSpec, overlay);
        expect(merged).toEqual(modified);

        // Round trip
        const { overlay: recovered } = splitOverlay(baseSpec, merged);
        const remerged = mergeOverlay(baseSpec, recovered);
        expect(remerged).toEqual(modified);
    });

    it("handles adding new component schemas via overlay", () => {
        const modified = structuredClone(baseSpec);
        modified.components.schemas.Owner = {
            type: "object",
            properties: {
                name: { type: "string" },
                email: { type: "string" }
            }
        };

        const overlay = generateOverlay(baseSpec, modified);
        const merged = mergeOverlay(baseSpec, overlay);
        expect(merged).toEqual(modified);
    });

    it("round-trips through YAML serialization with overlay", () => {
        const base = yamlRoundTrip(baseSpec);
        const modified = structuredClone(base);
        modified.paths["/pets"].get["x-fern-sdk-group-name"] = "pets";
        modified.paths["/pets"].get["x-fern-sdk-method-name"] = "list";

        const overlay = generateOverlay(base, modified);
        const overlayYaml = yamlRoundTrip(overlay);

        // Apply serialized overlay
        const merged = mergeOverlay(base, overlayYaml as ReturnType<typeof generateOverlay>);
        expect(merged).toEqual(modified);
    });

    it("handles deletions via overlay remove actions", () => {
        const modified = structuredClone(baseSpec);
        // Delete a property
        delete modified.info.description;
        // Delete a path
        delete modified.paths["/pets/{petId}"];

        const overlay = generateOverlay(baseSpec, modified);
        const merged = mergeOverlay(baseSpec, overlay);
        expect(merged).toEqual(modified);

        // Round trip
        const { overlay: recovered } = splitOverlay(baseSpec, merged);
        const remerged = mergeOverlay(baseSpec, recovered);
        expect(remerged).toEqual(modified);
    });

    it("handles array element modifications with index targeting via overlay", () => {
        const modified = structuredClone(baseSpec);
        // Modify 2nd parameter element by index
        modified.paths["/pets"].get.parameters[0].description = "Max items to return";

        const overlay = generateOverlay(baseSpec, modified);
        const merged = mergeOverlay(baseSpec, overlay);
        expect(merged).toEqual(modified);
    });

    it("handles combined additions and deletions via overlay", () => {
        const modified = structuredClone(baseSpec);
        modified.paths["/pets"].get["x-fern-group"] = "pets";
        delete modified.paths["/pets"].post;
        delete modified.components.schemas.Error;

        const overlay = generateOverlay(baseSpec, modified);
        const merged = mergeOverlay(baseSpec, overlay);
        expect(merged).toEqual(modified);

        // Round trip
        const { overlay: recovered } = splitOverlay(baseSpec, merged);
        const remerged = mergeOverlay(baseSpec, recovered);
        expect(remerged).toEqual(modified);
    });
});
