import { mergeWithOverrides } from "@fern-api/core-utils";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: test data
type Spec = Record<string, any>;

let testDir: string;

beforeEach(async () => {
    testDir = path.join(tmpdir(), `fern-merge-test-${randomUUID()}`);
    await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
});

async function writeYaml(filename: string, data: Spec): Promise<string> {
    const filepath = path.join(testDir, filename);
    await writeFile(filepath, yaml.dump(data, { lineWidth: -1, noRefs: true }));
    return filepath;
}

async function readYaml(filename: string): Promise<Spec> {
    const filepath = path.join(testDir, filename);
    const contents = await readFile(filepath, "utf8");
    return yaml.load(contents) as Spec;
}

function mergeSpec(base: Spec, overrides: Spec): Spec {
    return mergeWithOverrides({ data: structuredClone(base), overrides });
}

describe("merge logic", () => {
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

    const overrides: Spec = {
        paths: {
            "/pets": {
                get: {
                    "x-fern-sdk-group-name": "pets",
                    "x-fern-sdk-method-name": "list"
                }
            }
        },
        components: {
            schemas: {
                Pet: {
                    properties: {
                        breed: { type: "string" }
                    }
                }
            }
        }
    };

    it("deep merges override into base spec", () => {
        const merged = mergeSpec(baseSpec, overrides);

        // Original fields preserved
        expect(merged.openapi).toBe("3.0.0");
        expect(merged.info.title).toBe("Pet Store");
        expect(merged.paths["/pets"].get.operationId).toBe("listPets");
        expect(merged.paths["/pets"].get.summary).toBe("List all pets");

        // Override fields added
        expect(merged.paths["/pets"].get["x-fern-sdk-group-name"]).toBe("pets");
        expect(merged.paths["/pets"].get["x-fern-sdk-method-name"]).toBe("list");
        expect(merged.components.schemas.Pet.properties.breed).toEqual({ type: "string" });

        // Existing nested fields preserved
        expect(merged.components.schemas.Pet.properties.id).toEqual({ type: "integer" });
        expect(merged.components.schemas.Pet.properties.name).toEqual({ type: "string" });
    });

    it("merges multiple overrides sequentially", () => {
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

        let merged = mergeSpec(baseSpec, overrides1);
        merged = mergeSpec(merged, overrides2);

        expect(merged.paths["/pets"].get["x-fern-sdk-group-name"]).toBe("pets");
        expect(merged.paths["/pets"].get["x-fern-sdk-method-name"]).toBe("list");
        expect(merged.paths["/pets"].get.operationId).toBe("listPets");
    });

    it("writes merged result as YAML file", async () => {
        await writeYaml("openapi.yml", baseSpec);
        await writeYaml("overrides.yml", overrides);

        const base = await readYaml("openapi.yml");
        const over = await readYaml("overrides.yml");
        const merged = mergeSpec(base, over);

        await writeFile(path.join(testDir, "merged.yml"), yaml.dump(merged, { lineWidth: -1, noRefs: true }));
        const result = await readYaml("merged.yml");

        expect(result.paths["/pets"].get["x-fern-sdk-group-name"]).toBe("pets");
        expect(result.paths["/pets"].get.operationId).toBe("listPets");
    });

    it("is a no-op when overrides are empty", () => {
        const merged = mergeSpec(baseSpec, {});
        expect(merged).toEqual(baseSpec);
    });

    it("replaces primitive arrays entirely", () => {
        const base: Spec = { tags: ["a", "b"] };
        const over: Spec = { tags: ["c", "d"] };
        const merged = mergeSpec(base, over);
        expect(merged.tags).toEqual(["c", "d"]);
    });

    it("handles adding entirely new paths", () => {
        const over: Spec = {
            paths: {
                "/owners": {
                    get: { operationId: "listOwners" }
                }
            }
        };
        const merged = mergeSpec(baseSpec, over);
        expect(merged.paths["/owners"]).toBeDefined();
        expect(merged.paths["/pets"]).toBeDefined();
    });
});
