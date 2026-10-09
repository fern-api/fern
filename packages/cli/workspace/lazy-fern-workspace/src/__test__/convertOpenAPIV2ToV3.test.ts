import { CliError } from "@fern-api/task-context";
import { OpenAPIV2 } from "openapi-types";
import { vi } from "vitest";

import { convertOpenAPIV2ToV3 } from "../utils/convertOpenAPIV2ToV3.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

function createSwaggerSpec(): OpenAPIV2.Document {
    return {
        swagger: "2.0",
        info: {
            title: "Pet Store",
            version: "1.0.0"
        },
        host: "example.com",
        schemes: ["https"],
        paths: {
            "/pets": {
                get: {
                    operationId: "listPets",
                    responses: {
                        "200": {
                            description: "OK"
                        }
                    }
                }
            }
        },
        definitions: {
            Pet: {
                type: "object",
                properties: {
                    name: {
                        type: "string"
                    }
                }
            }
        }
    };
}

describe("convertOpenAPIV2ToV3", () => {
    it("converts a valid Swagger 2.0 document", async () => {
        const result = await convertOpenAPIV2ToV3(createSwaggerSpec());

        expect(result.openapi).toMatch(/^3\.0\./);
        expect(result.info.title).toBe("Pet Store");
    });

    it("converts a Swagger 2.0 document with a nullable type array in patch mode", async () => {
        const spec = createSwaggerSpec();
        const property = spec.definitions?.Pet?.properties?.name;
        if (property == null || Array.isArray(property) || "$ref" in property) {
            throw new Error("Expected Pet.name to be a schema object");
        }
        Object.assign(property, { type: ["null", "string"] });

        const context = createMockTaskContext();
        const warn = vi.spyOn(context.logger, "warn");
        const result = await convertOpenAPIV2ToV3(spec, { context });

        expect(result.components?.schemas?.Pet).toMatchObject({
            type: "object",
            properties: {
                name: {
                    type: "string",
                    nullable: true
                }
            }
        });
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("lenient (patch) mode"));
    });

    it("throws a CliError when the document cannot be converted", async () => {
        await expect(convertOpenAPIV2ToV3({} as OpenAPIV2.Document)).rejects.toBeInstanceOf(CliError);
    });
});
