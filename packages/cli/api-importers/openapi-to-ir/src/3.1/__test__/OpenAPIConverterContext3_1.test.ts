import { OpenAPIV3_1 } from "openapi-types"
import { describe, expect, it } from "vitest"

import { getOpenAPISettings } from "@fern-api/api-workspace-commons"
import { ErrorCollector } from "@fern-api/v2-importer-commons"

import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1"

describe("OpenAPIConverterContext3_1", async () => {
    it("resolves URL references", async () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {}
        }

        const context = new OpenAPIConverterContext3_1({
            spec,
            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            logger: undefined as any,
            generationLanguage: undefined,
            smartCasing: false,
            exampleGenerationArgs: { disabled: false },
            errorCollector: new ErrorCollector({
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                logger: undefined as any
            }),
            enableUniqueErrorsPerEndpoint: false,
            generateV1Examples: false,
            settings: getOpenAPISettings()
        })

        const result = await context.resolveMaybeExternalReference<OpenAPIV3_1.SchemaObject>({
            $ref: "https://raw.githubusercontent.com/OpenAPITools/openapi-petstore/refs/heads/master/src/main/resources/openapi.yaml#/components/schemas/Pet"
        })

        expect(result).toMatchSnapshot()
    }, 100_000)
})
