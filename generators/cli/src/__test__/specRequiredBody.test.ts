import { describe, expect, it } from "vitest";

import { buildRequiredBodyContracts, reconcileRequiredBodyProperties } from "../wireTests/specRequiredBody.js";

/**
 * Build a one-operation OpenAPI document whose request body is `schema`.
 */
function specWith(schema: unknown, extraComponents: Record<string, unknown> = {}): unknown {
    return {
        openapi: "3.1.0",
        info: { title: "t", version: "1" },
        paths: {
            "/v1/dubbing/resource/{dubbing_id}/translate": {
                post: {
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema } }
                    },
                    responses: { "200": { description: "ok" } }
                }
            }
        },
        components: { schemas: extraComponents }
    };
}

const ROUTE = { method: "POST", path: "/v1/dubbing/resource/{dubbing_id}/translate" };

function reconcile(document: unknown, body: unknown): { body: unknown; filled: string[] } {
    return reconcileRequiredBodyProperties({
        body,
        ...ROUTE,
        contracts: buildRequiredBodyContracts(document)
    });
}

describe("reconcileRequiredBodyProperties", () => {
    it("fills a required property whose schema is a nullable anyOf with null", () => {
        // The exact shape that broke the ElevenLabs suite: `required` in the
        // spec, but a nullable composition, so the IR models it as optional and
        // example generation skips it.
        const document = specWith({
            type: "object",
            required: ["segments", "languages"],
            properties: {
                segments: { type: "array", items: { type: "string" } },
                languages: { anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }] }
            }
        });

        const result = reconcile(document, { segments: ["segments"] });

        expect(result.body).toEqual({ segments: ["segments"], languages: null });
        expect(result.filled).toEqual(["languages"]);
    });

    it("fills a required OpenAPI 3.0 `nullable: true` property with null", () => {
        // 3.0 spells nullability as a sibling keyword rather than a union
        // branch. Both spellings must be recognised or the repair would only
        // work for 3.1 specs — half the specs we import.
        const document = specWith({
            type: "object",
            required: ["languages"],
            properties: { languages: { type: "array", items: { type: "string" }, nullable: true } }
        });

        const result = reconcile(document, {});

        expect(result.body).toEqual({ languages: null });
        expect(result.filled).toEqual(["languages"]);
    });

    it("fills a required 3.1 type-array nullable property with null", () => {
        // The third spelling: `type: ["string", "null"]`.
        const document = specWith({
            type: "object",
            required: ["label"],
            properties: { label: { type: ["string", "null"] } }
        });

        expect(reconcile(document, {}).body).toEqual({ label: null });
    });

    it("uses the non-null type when a type array does not include null", () => {
        // `type: ["string"]` is a required, non-nullable property: it needs a
        // real value, not a null.
        const document = specWith({
            type: "object",
            required: ["label"],
            properties: { label: { type: ["string"] } }
        });

        expect(reconcile(document, {}).body).toEqual({ label: "label" });
    });

    it("recognises a oneOf null branch as well as anyOf", () => {
        const document = specWith({
            type: "object",
            required: ["choice"],
            properties: { choice: { oneOf: [{ type: "string" }, { type: "null" }] } }
        });

        expect(reconcile(document, {}).body).toEqual({ choice: null });
    });

    it("resolves a requestBody that is itself a $ref", () => {
        // `requestBody: {$ref: '#/components/requestBodies/...'}` is common in
        // hand-written specs and would otherwise index as "no contract".
        const document = {
            openapi: "3.0.3",
            info: { title: "t", version: "1" },
            paths: {
                "/things": {
                    post: {
                        requestBody: { $ref: "#/components/requestBodies/ThingBody" },
                        responses: { "200": { description: "ok" } }
                    }
                }
            },
            components: {
                requestBodies: {
                    ThingBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["name"],
                                    properties: { name: { type: "string", nullable: true } }
                                }
                            }
                        }
                    }
                }
            }
        };

        const result = reconcileRequiredBodyProperties({
            body: {},
            method: "POST",
            path: "/things",
            contracts: buildRequiredBodyContracts(document)
        });

        expect(result.body).toEqual({ name: null });
    });

    it("indexes vendor and parameterized JSON media types", () => {
        // `application/vnd.api+json`, `application/merge-patch+json`, and
        // `application/json; charset=utf-8` all travel through `--json`.
        for (const mediaType of [
            "application/vnd.api+json",
            "application/merge-patch+json",
            "application/json; charset=utf-8"
        ]) {
            const document = {
                openapi: "3.1.0",
                info: { title: "t", version: "1" },
                paths: {
                    "/things": {
                        post: {
                            requestBody: {
                                content: {
                                    [mediaType]: {
                                        schema: {
                                            type: "object",
                                            required: ["name"],
                                            properties: { name: { type: "string" } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            expect(buildRequiredBodyContracts(document).size, mediaType).toBe(1);
        }
    });

    it("leaves a body alone when every required property is already present", () => {
        const document = specWith({
            type: "object",
            required: ["segments"],
            properties: { segments: { type: "array", items: { type: "string" } } }
        });

        const result = reconcile(document, { segments: ["segments"] });

        expect(result.filled).toEqual([]);
        // Same object back, so untouched cases can't churn the manifest.
        expect(result.body).toEqual({ segments: ["segments"] });
    });

    it("does not report a property the example set to null explicitly", () => {
        // Present-but-null already satisfies the CLI's `contains_key` check, so
        // repairing it would be a no-op recorded as a repair.
        const document = specWith({
            type: "object",
            required: ["languages"],
            properties: { languages: { anyOf: [{ type: "array" }, { type: "null" }] } }
        });

        expect(reconcile(document, { languages: null }).filled).toEqual([]);
    });

    it("honors const and enum over a synthesized placeholder", () => {
        const document = specWith({
            type: "object",
            required: ["kind", "mode"],
            properties: {
                kind: { type: "string", const: "new" },
                mode: { type: "string", enum: ["fast", "slow"] }
            }
        });

        const result = reconcile(document, {});

        expect(result.body).toEqual({ kind: "new", mode: "fast" });
    });

    it("resolves a $ref'd body schema and a $ref'd property", () => {
        const document = specWith(
            { $ref: "#/components/schemas/Body" },
            {
                Body: {
                    type: "object",
                    required: ["nested"],
                    properties: { nested: { $ref: "#/components/schemas/Nested" } }
                },
                Nested: { type: "object", required: ["id"], properties: { id: { type: "string" } } }
            }
        );

        const result = reconcile(document, {});

        expect(result.body).toEqual({ nested: { id: "id" } });
        expect(result.filled).toEqual(["nested"]);
    });

    it("synthesizes minimal values per declared type", () => {
        const document = specWith({
            type: "object",
            required: ["name", "count", "ratio", "flag", "tags"],
            properties: {
                name: { type: "string" },
                count: { type: "integer" },
                ratio: { type: "number" },
                flag: { type: "boolean" },
                tags: { type: "array", items: { type: "string" } }
            }
        });

        expect(reconcile(document, {}).body).toEqual({
            // The field name, matching the autogenerated-example convention so a
            // repaired body reads like a generated one.
            name: "name",
            count: 1,
            ratio: 1,
            flag: true,
            tags: []
        });
    });

    it("produces one item for an array with minItems", () => {
        const document = specWith({
            type: "object",
            required: ["tags"],
            properties: { tags: { type: "array", minItems: 1, items: { type: "string" } } }
        });

        expect(reconcile(document, {}).body).toEqual({ tags: ["tags"] });
    });

    it("declines rather than inventing a value it cannot derive", () => {
        // No type, no enum, no null branch, and a ref that goes nowhere: filling
        // would be guesswork, and leaving the gap fails the case for the same
        // reason it does today instead of for a new one.
        const document = specWith({
            type: "object",
            required: ["mystery", "dangling"],
            properties: { mystery: {}, dangling: { $ref: "#/components/schemas/Missing" } }
        });

        const result = reconcile(document, {});

        expect(result.filled).toEqual([]);
        expect(result.body).toEqual({});
    });

    it("matches routes regardless of how the path parameter is named", () => {
        // Fern renames a path param that collides with a body field
        // (`dubbing_id` → `dubbingIdPathParam`), so route matching must key on
        // position, not on the placeholder's name.
        const document = specWith({
            type: "object",
            required: ["languages"],
            properties: { languages: { anyOf: [{ type: "array" }, { type: "null" }] } }
        });

        const result = reconcileRequiredBodyProperties({
            body: {},
            method: "POST",
            path: "/v1/dubbing/resource/{dubbingIdPathParam}/translate",
            contracts: buildRequiredBodyContracts(document)
        });

        expect(result.filled).toEqual(["languages"]);
    });

    it("leaves non-object bodies untouched", () => {
        const document = specWith({
            type: "object",
            required: ["languages"],
            properties: { languages: { type: "string" } }
        });

        // Inventing a whole object where the example had none is a bigger leap
        // than reporting the mismatch.
        expect(reconcile(document, null).body).toBeNull();
        expect(reconcile(document, "text").body).toBe("text");
        expect(reconcile(document, [1, 2]).body).toEqual([1, 2]);
    });

    it("ignores operations whose body is not JSON", () => {
        const document = {
            openapi: "3.1.0",
            info: { title: "t", version: "1" },
            paths: {
                "/upload": {
                    post: {
                        requestBody: {
                            content: {
                                "multipart/form-data": {
                                    schema: { type: "object", required: ["file"], properties: { file: {} } }
                                }
                            }
                        }
                    }
                }
            }
        };

        expect(buildRequiredBodyContracts(document).size).toBe(0);
    });

    it("merges allOf branches when looking for required properties", () => {
        const document = specWith(
            { allOf: [{ $ref: "#/components/schemas/Base" }, { $ref: "#/components/schemas/Extra" }] },
            {
                Base: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
                Extra: { type: "object", required: ["flag"], properties: { flag: { type: "boolean" } } }
            }
        );

        const result = reconcile(document, {});

        expect(result.body).toEqual({ id: "id", flag: true });
        expect(result.filled).toEqual(["id", "flag"]);
    });

    it("fills a required property missing inside an array item the example did supply", () => {
        // The same bug one level down, and the reason the repair recurses rather
        // than only walking the top level: ElevenLabs' pronunciation-dictionary
        // endpoint supplied the array but each element was missing a required
        // `version_id`.
        const document = specWith({
            type: "object",
            required: ["locators"],
            properties: {
                locators: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["dictionary_id", "version_id"],
                        properties: {
                            dictionary_id: { type: "string" },
                            version_id: { anyOf: [{ type: "string" }, { type: "null" }] }
                        }
                    }
                }
            }
        });

        const result = reconcile(document, { locators: [{ dictionary_id: "d1" }, { dictionary_id: "d2" }] });

        expect(result.body).toEqual({
            locators: [
                { dictionary_id: "d1", version_id: null },
                { dictionary_id: "d2", version_id: null }
            ]
        });
        // Indexed paths, so the diagnostic points at the exact element.
        expect(result.filled).toEqual(["locators[0].version_id", "locators[1].version_id"]);
    });

    it("descends into a nested object the example already provided", () => {
        const document = specWith({
            type: "object",
            required: ["config"],
            properties: {
                config: {
                    type: "object",
                    required: ["mode", "retries"],
                    properties: { mode: { type: "string" }, retries: { type: "integer" } }
                }
            }
        });

        const result = reconcile(document, { config: { mode: "fast" } });

        expect(result.body).toEqual({ config: { mode: "fast", retries: 1 } });
        expect(result.filled).toEqual(["config.retries"]);
    });

    it("descends through a nullable wrapper into the object it wraps", () => {
        const document = specWith({
            type: "object",
            required: ["config"],
            properties: {
                config: {
                    anyOf: [
                        { type: "object", required: ["mode"], properties: { mode: { type: "string" } } },
                        { type: "null" }
                    ]
                }
            }
        });

        // The example gave a non-null object, so the nullable branch must not
        // stop the walk.
        expect(reconcile(document, { config: {} }).filled).toEqual(["config.mode"]);
    });

    it("returns no contracts for a document with no required body properties", () => {
        const document = specWith({ type: "object", properties: { optional: { type: "string" } } });

        expect(buildRequiredBodyContracts(document).size).toBe(0);
    });

    it("survives a schema that references itself", () => {
        // A cyclic spec must not hang the generator; the depth bound is what
        // makes that true without cycle bookkeeping.
        const document = specWith(
            { $ref: "#/components/schemas/Node" },
            {
                Node: {
                    type: "object",
                    required: ["child"],
                    properties: { child: { $ref: "#/components/schemas/Node" } }
                }
            }
        );

        expect(() => reconcile(document, {})).not.toThrow();
    });
});
