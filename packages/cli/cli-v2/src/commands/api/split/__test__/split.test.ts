import { mergeWithOverrides } from "@fern-api/core-utils";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateOverrides } from "../diffSpecs.js";

// biome-ignore lint/suspicious/noExplicitAny: test data
type Spec = Record<string, any>;

let testDir: string;

beforeEach(async () => {
    testDir = path.join(tmpdir(), `fern-split-test-${randomUUID()}`);
    await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
});

function mergeSpec(base: Spec, overrides: Spec): Spec {
    return mergeWithOverrides({ data: structuredClone(base), overrides });
}

describe("split logic (generateOverrides)", () => {
    const baseSpec: Spec = {
        openapi: "3.0.0",
        info: { title: "Pet Store", version: "1.0.0" },
        paths: {
            "/pets": {
                get: {
                    operationId: "listPets",
                    summary: "List all pets",
                    responses: {
                        "200": { description: "A list of pets" }
                    }
                }
            }
        },
        components: {
            schemas: {
                Pet: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" }
                    }
                }
            }
        }
    };

    it("extracts added x-fern extensions as overrides", () => {
        const modified = structuredClone(baseSpec);
        modified.paths["/pets"].get["x-fern-sdk-group-name"] = "pets";
        modified.paths["/pets"].get["x-fern-sdk-method-name"] = "list";

        const overrides = generateOverrides(baseSpec, modified);

        expect(overrides).toEqual({
            paths: {
                "/pets": {
                    get: {
                        "x-fern-sdk-group-name": "pets",
                        "x-fern-sdk-method-name": "list"
                    }
                }
            }
        });
    });

    it("extracts added properties as overrides", () => {
        const modified = structuredClone(baseSpec);
        modified.components.schemas.Pet.properties.breed = { type: "string" };

        const overrides = generateOverrides(baseSpec, modified);

        expect(overrides).toEqual({
            components: {
                schemas: {
                    Pet: {
                        properties: {
                            breed: { type: "string" }
                        }
                    }
                }
            }
        });
    });

    it("extracts modified values as overrides", () => {
        const modified = structuredClone(baseSpec);
        modified.info.title = "Updated Pet Store";

        const overrides = generateOverrides(baseSpec, modified);

        expect(overrides).toEqual({
            info: { title: "Updated Pet Store" }
        });
    });

    it("returns empty overrides for identical specs", () => {
        const overrides = generateOverrides(baseSpec, structuredClone(baseSpec));
        expect(Object.keys(overrides)).toHaveLength(0);
    });

    it("extracts added paths as overrides", () => {
        const modified = structuredClone(baseSpec);
        modified.paths["/owners"] = {
            get: { operationId: "listOwners", summary: "List owners" }
        };

        const overrides = generateOverrides(baseSpec, modified);

        expect(overrides.paths["/owners"]).toBeDefined();
        expect(overrides.paths["/pets"]).toBeUndefined();
    });

    it("works with file round-trip through YAML", async () => {
        const specPath = path.join(testDir, "openapi.yml");
        await writeFile(specPath, yaml.dump(baseSpec, { lineWidth: -1, noRefs: true }));

        // Read and modify
        const raw = await readFile(specPath, "utf8");
        const loaded = yaml.load(raw) as Spec;
        loaded.paths["/pets"].get["x-fern-sdk-group-name"] = "pets";

        // Generate overrides
        const original = yaml.load(yaml.dump(baseSpec, { lineWidth: -1, noRefs: true })) as Spec;
        const overrides = generateOverrides(original, loaded);

        expect(overrides.paths["/pets"].get["x-fern-sdk-group-name"]).toBe("pets");
    });
});
