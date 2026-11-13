import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";
import { parse } from "../parse.js";

const mockTaskContext = {
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), trace: vi.fn(), log: vi.fn() }
} as unknown as TaskContext;

const doc: OpenAPIV3.Document = {
    openapi: "3.0.3",
    info: { title: "TwiML", version: "1.0" },
    paths: {},
    components: {
        schemas: {
            VoiceResponse: {
                type: "object",
                xml: { name: "Response" },
                properties: {
                    children: {
                        type: "array",
                        items: {
                            oneOf: [{ $ref: "#/components/schemas/Say" }, { $ref: "#/components/schemas/Hangup" }]
                        },
                        xml: { wrapped: false }
                    }
                },
                example: { children: [{ voice: "alice", message: "Thanks for calling." }, {}] }
            },
            Say: {
                type: "object",
                xml: { name: "Say" },
                properties: {
                    voice: {
                        type: "string",
                        enum: ["man", "woman", "alice"],
                        xml: { attribute: true },
                        example: "alice"
                    },
                    loop: { type: "integer", xml: { attribute: true }, example: 2 },
                    message: { type: "string", example: "Thanks for calling." }
                },
                example: { voice: "alice", loop: 2, message: "Thanks for calling." }
            },
            Hangup: { type: "object", xml: { name: "Hangup" }, properties: {} },
            Pause: {
                type: "object",
                xml: { name: "Pause" },
                properties: {
                    length: { type: "integer", xml: { attribute: true }, example: 5 },
                    label: { type: "string", xml: { attribute: true } }
                }
            }
        }
    }
};

describe("object schema examples", () => {
    it("keeps the schema-level example, assembles one from property examples, and leaves bare objects without one", () => {
        const ir = parse({
            context: mockTaskContext,
            documents: [
                {
                    type: "openapi",
                    value: doc,
                    source: Source.openapi({ file: "twiml.yml" }),
                    settings: DEFAULT_PARSE_OPENAPI_SETTINGS
                }
            ],
            options: DEFAULT_PARSE_OPENAPI_SETTINGS
        });
        const schemas = ir.groupedSchemas.rootSchemas;
        const examplesOf = (name: string): unknown => {
            const schema = schemas[name];
            return schema?.type === "object" ? schema.examples : "not-an-object";
        };
        console.log(
            JSON.stringify(
                {
                    Say: examplesOf("Say"),
                    VoiceResponse: examplesOf("VoiceResponse"),
                    Pause: examplesOf("Pause"),
                    Hangup: examplesOf("Hangup")
                },
                null,
                1
            )
        );
        expect(examplesOf("Hangup")).toBeUndefined();
        expect(examplesOf("Say")).toHaveLength(1);
        expect(examplesOf("Pause")).toHaveLength(1);
        expect(examplesOf("VoiceResponse")).toHaveLength(1);
    });
});
