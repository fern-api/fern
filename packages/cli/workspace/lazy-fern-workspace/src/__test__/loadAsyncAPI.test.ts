import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";

import { loadAsyncAPI } from "../utils/loadAsyncAPI.js";
import { clearFileCache } from "../utils/resolveExternalRefs.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

// loadAsyncAPI returns DocumentV2 | DocumentV3; our fixtures are plain objects
// that don't perfectly match either union member. Cast through unknown for field access.
interface AsyncAPIResult {
    asyncapi: string;
    info: Record<string, unknown>;
    channels: Record<string, unknown>;
}

const BASE_DOC = {
    asyncapi: "2.6.0",
    info: {
        title: "Base API",
        version: "1.0.0"
    },
    channels: {
        "/events": {
            publish: {
                operationId: "publishEvent"
            }
        }
    }
};

describe("loadAsyncAPI", () => {
    let tempDir: string;
    const context = createMockTaskContext();

    beforeEach(async () => {
        tempDir = join(tmpdir(), `load-asyncapi-test-${Date.now()}`);
        await mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it("loads document without overrides", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: undefined
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.asyncapi).toBe("2.6.0");
        expect(result.info.title).toBe("Base API");
        expect(result.info.version).toBe("1.0.0");
        expect(result.channels).toHaveProperty("/events");
    });

    it("applies a single override string", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const overridePath = join(tempDir, "override.yml");
        await writeFile(overridePath, yaml.dump({ info: { title: "Overridden API" } }));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: AbsoluteFilePath.of(overridePath)
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.info.title).toBe("Overridden API");
        expect(result.info.version).toBe("1.0.0");
    });

    it("applies multiple overrides sequentially", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const override1Path = join(tempDir, "override1.yml");
        await writeFile(
            override1Path,
            yaml.dump({ info: { title: "First Override", description: "Added by first override" } })
        );

        const override2Path = join(tempDir, "override2.yml");
        await writeFile(override2Path, yaml.dump({ info: { title: "Second Override", contact: { name: "Support" } } }));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: [AbsoluteFilePath.of(override1Path), AbsoluteFilePath.of(override2Path)]
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.info.title).toBe("Second Override");
        expect(result.info.description).toBe("Added by first override");
        expect(result.info.contact).toEqual({ name: "Support" });
        expect(result.info.version).toBe("1.0.0");
    });

    it("preserves order: later overrides take precedence", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const override1Path = join(tempDir, "override1.yml");
        await writeFile(override1Path, yaml.dump({ info: { version: "2.0.0" } }));

        const override2Path = join(tempDir, "override2.yml");
        await writeFile(override2Path, yaml.dump({ info: { version: "3.0.0" } }));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: [AbsoluteFilePath.of(override1Path), AbsoluteFilePath.of(override2Path)]
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.info.version).toBe("3.0.0");
        expect(result.info.title).toBe("Base API");
    });

    it("later override setting parent key deep-merges with child keys from earlier override", async () => {
        // Override 1 sets a deep nested key: channels./events.publish.description = "from first"
        // Override 2 sets the parent: channels./events.publish = { summary: "from second" }
        // Because lodash mergeWith does recursive deep merge, both keys should survive.
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const override1Path = join(tempDir, "override1.yml");
        await writeFile(
            override1Path,
            yaml.dump({
                channels: { "/events": { publish: { description: "from first" } } }
            })
        );

        const override2Path = join(tempDir, "override2.yml");
        await writeFile(
            override2Path,
            yaml.dump({
                channels: { "/events": { publish: { summary: "from second" } } }
            })
        );

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: [AbsoluteFilePath.of(override1Path), AbsoluteFilePath.of(override2Path)]
        });
        const result = raw as unknown as AsyncAPIResult;
        const publish = (result.channels as Record<string, Record<string, Record<string, unknown>>>)["/events"]
            ?.publish;

        // Deep merge: all three keys coexist (original operationId + override1 description + override2 summary)
        expect(publish?.operationId).toBe("publishEvent");
        expect(publish?.description).toBe("from first");
        expect(publish?.summary).toBe("from second");
    });

    it("handles empty overrides array", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: []
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.asyncapi).toBe("2.6.0");
        expect(result.info.title).toBe("Base API");
        expect(result.info.version).toBe("1.0.0");
        expect(result.channels).toHaveProperty("/events");
    });
});

describe("loadAsyncAPI — external $ref resolution", () => {
    let tempDir: string;
    const context = createMockTaskContext();

    beforeEach(async () => {
        tempDir = join(tmpdir(), `load-asyncapi-ext-ref-test-${Date.now()}`);
        await mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
        clearFileCache();
        await rm(tempDir, { recursive: true, force: true });
    });

    it("resolves a simple external file ref (no JSON pointer)", async () => {
        // external.yml contains a plain schema object
        const externalSchema = { type: "object", properties: { id: { type: "string" } } };
        await writeFile(join(tempDir, "external.yml"), yaml.dump(externalSchema));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/items": {
                    publish: {
                        message: {
                            payload: { $ref: "./external.yml" }
                        }
                    }
                }
            }
        };
        await writeFile(join(tempDir, "asyncapi.yml"), yaml.dump(doc));

        const result = (await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(join(tempDir, "asyncapi.yml")),
            absoluteFilePathToOverrides: undefined
        })) as unknown as Record<string, unknown>;

        const channels = result["channels"] as Record<string, unknown>;
        const payload = ((channels["/items"] as Record<string, unknown>)["publish"] as Record<string, unknown>)[
            "message"
        ] as Record<string, unknown>;

        // The $ref should have been replaced with the inline schema
        expect(payload["payload"]).toEqual(externalSchema);
        expect(payload["payload"]).not.toHaveProperty("$ref");
    });

    it("resolves an external file ref with a JSON pointer fragment", async () => {
        // schemas.yml holds multiple named schemas; we reference just one
        const schemasFile = {
            SpeakV1Encoding: {
                type: "object",
                properties: { encoding: { type: "string" } }
            },
            OtherType: { type: "string" }
        };
        await writeFile(join(tempDir, "schemas.yml"), yaml.dump(schemasFile));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/speak": {
                    publish: {
                        message: {
                            payload: { $ref: "./schemas.yml#/SpeakV1Encoding" }
                        }
                    }
                }
            }
        };
        await writeFile(join(tempDir, "asyncapi.yml"), yaml.dump(doc));

        const result = (await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(join(tempDir, "asyncapi.yml")),
            absoluteFilePathToOverrides: undefined
        })) as unknown as Record<string, unknown>;

        const channels = result["channels"] as Record<string, unknown>;
        const payload = ((channels["/speak"] as Record<string, unknown>)["publish"] as Record<string, unknown>)[
            "message"
        ] as Record<string, unknown>;

        // Only the SpeakV1Encoding entry, not the whole file
        expect(payload["payload"]).toEqual(schemasFile.SpeakV1Encoding);
        expect(payload["payload"]).not.toHaveProperty("$ref");
    });

    it("resolves nested (transitive) external refs", async () => {
        // level2.yml is referenced by level1.yml which is referenced by the main doc
        const level2Schema = { type: "string", description: "deeply nested" };
        await writeFile(join(tempDir, "level2.yml"), yaml.dump(level2Schema));

        const level1Content = {
            NestedType: { $ref: "./level2.yml" }
        };
        await writeFile(join(tempDir, "level1.yml"), yaml.dump(level1Content));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/data": {
                    publish: {
                        message: {
                            payload: { $ref: "./level1.yml#/NestedType" }
                        }
                    }
                }
            }
        };
        await writeFile(join(tempDir, "asyncapi.yml"), yaml.dump(doc));

        const result = (await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(join(tempDir, "asyncapi.yml")),
            absoluteFilePathToOverrides: undefined
        })) as unknown as Record<string, unknown>;

        const channels = result["channels"] as Record<string, unknown>;
        const payload = ((channels["/data"] as Record<string, unknown>)["publish"] as Record<string, unknown>)[
            "message"
        ] as Record<string, unknown>;

        // The transitive chain should resolve all the way to level2Schema
        expect(payload["payload"]).toEqual(level2Schema);
        expect(payload["payload"]).not.toHaveProperty("$ref");
    });

    it("preserves internal $refs and resolves only external ones", async () => {
        const externalSchema = { type: "object", properties: { name: { type: "string" } } };
        await writeFile(join(tempDir, "external.yml"), yaml.dump(externalSchema));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            components: {
                schemas: {
                    InternalFoo: { type: "integer" }
                }
            },
            channels: {
                "/a": {
                    publish: {
                        message: {
                            // internal ref — must survive unchanged
                            payload: { $ref: "#/components/schemas/InternalFoo" }
                        }
                    }
                },
                "/b": {
                    publish: {
                        message: {
                            // external ref — must be inlined
                            payload: { $ref: "./external.yml" }
                        }
                    }
                }
            }
        };
        await writeFile(join(tempDir, "asyncapi.yml"), yaml.dump(doc));

        const result = (await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(join(tempDir, "asyncapi.yml")),
            absoluteFilePathToOverrides: undefined
        })) as unknown as Record<string, unknown>;

        const channels = result["channels"] as Record<string, unknown>;

        const payloadA = (
            ((channels["/a"] as Record<string, unknown>)["publish"] as Record<string, unknown>)["message"] as Record<
                string,
                unknown
            >
        )["payload"] as Record<string, unknown>;

        const payloadB = (
            ((channels["/b"] as Record<string, unknown>)["publish"] as Record<string, unknown>)["message"] as Record<
                string,
                unknown
            >
        )["payload"] as Record<string, unknown>;

        // Internal ref preserved
        expect(payloadA["$ref"]).toBe("#/components/schemas/InternalFoo");

        // External ref inlined
        expect(payloadB).toEqual(externalSchema);
        expect(payloadB["$ref"]).toBeUndefined();
    });

    it("preserves sibling properties alongside external $ref (AsyncAPI 3.x)", async () => {
        // External file has a base schema
        const externalSchema = {
            type: "object",
            description: "Original description from external file",
            properties: { id: { type: "string" } }
        };
        await writeFile(join(tempDir, "external.yml"), yaml.dump(externalSchema));

        // Main doc references external file but adds sibling properties
        // that should override the resolved content
        const doc = {
            asyncapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/items": {
                    publish: {
                        message: {
                            payload: {
                                $ref: "./external.yml",
                                description: "Overridden description from main doc",
                                "x-custom": "custom-value"
                            }
                        }
                    }
                }
            }
        };
        await writeFile(join(tempDir, "asyncapi.yml"), yaml.dump(doc));

        const result = (await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(join(tempDir, "asyncapi.yml")),
            absoluteFilePathToOverrides: undefined
        })) as unknown as Record<string, unknown>;

        const channels = result["channels"] as Record<string, unknown>;
        const payload = ((channels["/items"] as Record<string, unknown>)["publish"] as Record<string, unknown>)[
            "message"
        ] as Record<string, unknown>;
        const resolved = payload["payload"] as Record<string, unknown>;

        // $ref should be gone (inlined)
        expect(resolved["$ref"]).toBeUndefined();
        // Properties from the external file should be present
        expect(resolved["type"]).toBe("object");
        expect(resolved["properties"]).toEqual({ id: { type: "string" } });
        // Sibling properties should override the external file's values
        expect(resolved["description"]).toBe("Overridden description from main doc");
        // Extra sibling properties should be preserved
        expect(resolved["x-custom"]).toBe("custom-value");
    });

    it("uses file cache for multiple refs to the same file", async () => {
        // A single external file referenced twice with different JSON pointers
        const schemasFile = {
            TypeA: { type: "string", description: "Type A" },
            TypeB: { type: "integer", description: "Type B" }
        };
        await writeFile(join(tempDir, "schemas.yml"), yaml.dump(schemasFile));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/a": {
                    publish: {
                        message: {
                            payload: { $ref: "./schemas.yml#/TypeA" }
                        }
                    }
                },
                "/b": {
                    publish: {
                        message: {
                            payload: { $ref: "./schemas.yml#/TypeB" }
                        }
                    }
                }
            }
        };
        await writeFile(join(tempDir, "asyncapi.yml"), yaml.dump(doc));

        const result = (await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(join(tempDir, "asyncapi.yml")),
            absoluteFilePathToOverrides: undefined
        })) as unknown as Record<string, unknown>;

        const channels = result["channels"] as Record<string, unknown>;

        const payloadA = (
            ((channels["/a"] as Record<string, unknown>)["publish"] as Record<string, unknown>)["message"] as Record<
                string,
                unknown
            >
        )["payload"] as Record<string, unknown>;

        const payloadB = (
            ((channels["/b"] as Record<string, unknown>)["publish"] as Record<string, unknown>)["message"] as Record<
                string,
                unknown
            >
        )["payload"] as Record<string, unknown>;

        // Both pointers should resolve correctly from the same cached file
        expect(payloadA).toEqual(schemasFile.TypeA);
        expect(payloadA["$ref"]).toBeUndefined();
        expect(payloadB).toEqual(schemasFile.TypeB);
        expect(payloadB["$ref"]).toBeUndefined();
    });
});
