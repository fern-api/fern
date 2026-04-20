import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";

import { loadAsyncAPI } from "../utils/loadAsyncAPI.js";
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

    it("resolves diamond-shaped transitive refs (two paths to same file)", async () => {
        // shared.yml is referenced by both a.yml and b.yml
        const sharedSchema = { type: "string", description: "shared leaf" };
        await writeFile(join(tempDir, "shared.yml"), yaml.dump(sharedSchema));

        // a.yml and b.yml both reference shared.yml
        await writeFile(join(tempDir, "a.yml"), yaml.dump({ AType: { $ref: "./shared.yml" } }));
        await writeFile(join(tempDir, "b.yml"), yaml.dump({ BType: { $ref: "./shared.yml" } }));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/a": {
                    publish: {
                        message: { payload: { $ref: "./a.yml#/AType" } }
                    }
                },
                "/b": {
                    publish: {
                        message: { payload: { $ref: "./b.yml#/BType" } }
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

        // Both should resolve through their intermediary files down to the same shared leaf
        expect(payloadA).toEqual(sharedSchema);
        expect(payloadA["$ref"]).toBeUndefined();
        expect(payloadB).toEqual(sharedSchema);
        expect(payloadB["$ref"]).toBeUndefined();
    });

    it("resolves an external file that contains multiple nested external refs", async () => {
        // leaf1.yml and leaf2.yml are simple schemas
        await writeFile(join(tempDir, "leaf1.yml"), yaml.dump({ type: "string" }));
        await writeFile(join(tempDir, "leaf2.yml"), yaml.dump({ type: "integer" }));

        // parent.yml references both leaf files in different properties
        const parentContent = {
            type: "object",
            properties: {
                fieldA: { $ref: "./leaf1.yml" },
                fieldB: { $ref: "./leaf2.yml" }
            }
        };
        await writeFile(join(tempDir, "parent.yml"), yaml.dump(parentContent));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/data": {
                    publish: {
                        message: { payload: { $ref: "./parent.yml" } }
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
        const payload = (
            ((channels["/data"] as Record<string, unknown>)["publish"] as Record<string, unknown>)["message"] as Record<
                string,
                unknown
            >
        )["payload"] as Record<string, unknown>;

        // The parent file should be fully resolved with both leaf schemas inlined
        expect(payload["$ref"]).toBeUndefined();
        expect(payload["type"]).toBe("object");
        const properties = payload["properties"] as Record<string, unknown>;
        expect(properties["fieldA"]).toEqual({ type: "string" });
        expect(properties["fieldB"]).toEqual({ type: "integer" });
    });

    it("resolves a deep chain with mixed JSON pointer and whole-file refs", async () => {
        // level3.yml — leaf
        await writeFile(join(tempDir, "level3.yml"), yaml.dump({ type: "boolean", description: "deep leaf" }));

        // level2.yml — references level3 via JSON pointer
        await writeFile(
            join(tempDir, "level2.yml"),
            yaml.dump({
                Wrapper: {
                    type: "object",
                    properties: {
                        flag: { $ref: "./level3.yml" }
                    }
                }
            })
        );

        // level1.yml — references level2 with a JSON pointer into Wrapper
        await writeFile(
            join(tempDir, "level1.yml"),
            yaml.dump({
                Inner: { $ref: "./level2.yml#/Wrapper" }
            })
        );

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/deep": {
                    publish: {
                        message: { payload: { $ref: "./level1.yml#/Inner" } }
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
        const payload = (
            ((channels["/deep"] as Record<string, unknown>)["publish"] as Record<string, unknown>)["message"] as Record<
                string,
                unknown
            >
        )["payload"] as Record<string, unknown>;

        // Should resolve the full chain: level1 → level2#/Wrapper → level3 (inside properties.flag)
        expect(payload["$ref"]).toBeUndefined();
        expect(payload["type"]).toBe("object");
        const properties = payload["properties"] as Record<string, unknown>;
        expect(properties["flag"]).toEqual({ type: "boolean", description: "deep leaf" });
    });

    it("throws on direct circular ref between two files (A → B → A)", async () => {
        // a.yml references b.yml, and b.yml references a.yml
        await writeFile(join(tempDir, "a.yml"), yaml.dump({ AType: { $ref: "./b.yml#/BType" } }));
        await writeFile(join(tempDir, "b.yml"), yaml.dump({ BType: { $ref: "./a.yml#/AType" } }));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/cycle": {
                    publish: {
                        message: { payload: { $ref: "./a.yml#/AType" } }
                    }
                }
            }
        };
        await writeFile(join(tempDir, "asyncapi.yml"), yaml.dump(doc));

        await expect(
            loadAsyncAPI({
                context,
                absoluteFilePath: AbsoluteFilePath.of(join(tempDir, "asyncapi.yml")),
                absoluteFilePathToOverrides: undefined
            })
        ).rejects.toThrow(/Circular \$ref detected/);
    });

    it("throws on self-referencing file", async () => {
        // self.yml references itself
        await writeFile(join(tempDir, "self.yml"), yaml.dump({ SelfType: { $ref: "./self.yml#/SelfType" } }));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/self": {
                    publish: {
                        message: { payload: { $ref: "./self.yml#/SelfType" } }
                    }
                }
            }
        };
        await writeFile(join(tempDir, "asyncapi.yml"), yaml.dump(doc));

        await expect(
            loadAsyncAPI({
                context,
                absoluteFilePath: AbsoluteFilePath.of(join(tempDir, "asyncapi.yml")),
                absoluteFilePathToOverrides: undefined
            })
        ).rejects.toThrow(/Circular \$ref detected/);
    });

    it("throws on indirect circular ref (A → B → C → A)", async () => {
        await writeFile(join(tempDir, "a.yml"), yaml.dump({ A: { $ref: "./b.yml#/B" } }));
        await writeFile(join(tempDir, "b.yml"), yaml.dump({ B: { $ref: "./c.yml#/C" } }));
        await writeFile(join(tempDir, "c.yml"), yaml.dump({ C: { $ref: "./a.yml#/A" } }));

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/cycle": {
                    publish: {
                        message: { payload: { $ref: "./a.yml#/A" } }
                    }
                }
            }
        };
        await writeFile(join(tempDir, "asyncapi.yml"), yaml.dump(doc));

        await expect(
            loadAsyncAPI({
                context,
                absoluteFilePath: AbsoluteFilePath.of(join(tempDir, "asyncapi.yml")),
                absoluteFilePathToOverrides: undefined
            })
        ).rejects.toThrow(/Circular \$ref detected/);
    });

    it("rewrites file-local refs in inlined content via registry", async () => {
        // Reproduces the Deepgram pattern: a schema file defines messages that
        // use file-local #/Sibling refs to sibling definitions in the same file.
        // When the message is inlined into the main doc, those file-local refs
        // must be rewritten to #/components/schemas/Sibling (via registry).
        await mkdir(join(tempDir, "schemas"), { recursive: true });
        await mkdir(join(tempDir, "channels"), { recursive: true });

        // schemas/schemas.listen.yml — message + sibling schemas
        await writeFile(
            join(tempDir, "schemas", "schemas.listen.yml"),
            yaml.dump({
                EagerEotThreshold: {
                    type: "number",
                    description: "Eager EOT threshold"
                },
                ListenConfigure: {
                    name: "ListenConfigure",
                    payload: {
                        type: "object",
                        properties: {
                            type: { type: "string", const: "Configure" },
                            threshold: { $ref: "#/EagerEotThreshold" }
                        }
                    }
                }
            })
        );

        // channels/listen.yml — references the message from the schemas file
        await writeFile(
            join(tempDir, "channels", "listen.yml"),
            yaml.dump({
                Listen: {
                    messages: {
                        ListenConfigure: {
                            $ref: "../schemas/schemas.listen.yml#/ListenConfigure"
                        }
                    }
                }
            })
        );

        // Main doc — registers EagerEotThreshold in components.schemas and
        // the channel via external refs
        const doc = {
            asyncapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                Listen: { $ref: "./channels/listen.yml#/Listen" }
            },
            components: {
                schemas: {
                    EagerEotThreshold: {
                        $ref: "./schemas/schemas.listen.yml#/EagerEotThreshold"
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

        // The channel message should be inlined, and the file-local
        // #/EagerEotThreshold ref inside it should be rewritten to the
        // registry path #/components/schemas/EagerEotThreshold
        const channels = result["channels"] as Record<string, unknown>;
        const listen = channels["Listen"] as Record<string, unknown>;
        const messages = listen["messages"] as Record<string, unknown>;
        const configure = messages["ListenConfigure"] as Record<string, unknown>;
        const payload = configure["payload"] as Record<string, unknown>;
        const properties = payload["properties"] as Record<string, unknown>;
        const threshold = properties["threshold"] as Record<string, unknown>;

        expect(threshold["$ref"]).toBe("#/components/schemas/EagerEotThreshold");
    });

    it("inlines file-local refs when target is not in registry", async () => {
        // When a file-local ref points to a sibling that is NOT registered in
        // components.schemas (or any other registry section), the bundler should
        // inline the content from the source file rather than leaving a dangling ref.
        await mkdir(join(tempDir, "schemas"), { recursive: true });

        await writeFile(
            join(tempDir, "schemas", "types.yml"),
            yaml.dump({
                HelperType: {
                    type: "string",
                    description: "A helper type not registered in main doc"
                },
                MainType: {
                    type: "object",
                    properties: {
                        helper: { $ref: "#/HelperType" }
                    }
                }
            })
        );

        const doc = {
            asyncapi: "2.6.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                "/data": {
                    publish: {
                        message: {
                            payload: { $ref: "./schemas/types.yml#/MainType" }
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
        const payload = (
            ((channels["/data"] as Record<string, unknown>)["publish"] as Record<string, unknown>)["message"] as Record<
                string,
                unknown
            >
        )["payload"] as Record<string, unknown>;

        // MainType should be inlined
        expect(payload["$ref"]).toBeUndefined();
        expect(payload["type"]).toBe("object");

        // The file-local #/HelperType ref should also be fully inlined
        const properties = payload["properties"] as Record<string, unknown>;
        const helper = properties["helper"] as Record<string, unknown>;
        expect(helper["$ref"]).toBeUndefined();
        expect(helper["type"]).toBe("string");
        expect(helper["description"]).toBe("A helper type not registered in main doc");
    });

    it("leaves HTTP/HTTPS $ref values untouched for downstream resolution", async () => {
        const doc = {
            asyncapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            channels: {
                testChannel: {
                    address: "/test",
                    messages: {
                        sendMessage: {
                            $ref: "https://example.com/specs/asyncapi.json#/components/messages/sendMessage"
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
        const messages = (channels["testChannel"] as Record<string, unknown>)["messages"] as Record<string, unknown>;
        const sendMessage = messages["sendMessage"] as Record<string, unknown>;

        // URL refs should be preserved as-is for AbstractSpecConverter.resolveAllExternalRefs
        expect(sendMessage["$ref"]).toBe("https://example.com/specs/asyncapi.json#/components/messages/sendMessage");
    });
});
