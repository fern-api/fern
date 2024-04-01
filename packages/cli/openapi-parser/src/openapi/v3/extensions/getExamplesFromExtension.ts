import { FernOpenapiIr } from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { getExtensionAndValidate } from "../../../getExtension";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { OperationContext } from "../converters/contexts";
import { RedoclyCodeSampleArraySchema, RedoclyCodeSampleSchema } from "../schemas/RedoclyCodeSampleSchema";
import { OpenAPIExtension } from "./extensions";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getExamplesFromExtension(
    operationContext: OperationContext,
    operationObject: OpenAPIV3.OperationObject,
    context: AbstractOpenAPIV3ParserContext
): RawSchemas.ExampleEndpointCallArraySchema {
    const exampleEndpointCalls: RawSchemas.ExampleEndpointCallArraySchema =
        getExtensionAndValidate(
            operationObject,
            FernOpenAPIExtension.EXAMPLES,
            RawSchemas.ExampleEndpointCallArraySchema,
            context,
            [...operationContext.baseBreadcrumbs, `${operationContext.method} ${operationContext.path}`]
        ) ?? [];

    const redoclyCodeSamplesKebabCase =
        getExtensionAndValidate<RedoclyCodeSampleArraySchema>(
            operationObject,
            OpenAPIExtension.REDOCLY_CODE_SAMPLES_KEBAB,
            RedoclyCodeSampleArraySchema,
            context,
            [...operationContext.baseBreadcrumbs, `${operationContext.method} ${operationContext.path}`]
        ) ?? [];

    const redoclyCodeSamplesCamelCase =
        getExtensionAndValidate<RedoclyCodeSampleArraySchema>(
            operationObject,
            OpenAPIExtension.REDOCLY_CODE_SAMPLES_CAMEL,
            RedoclyCodeSampleArraySchema,
            context,
            [...operationContext.baseBreadcrumbs, `${operationContext.method} ${operationContext.path}`]
        ) ?? [];

    const redoclyCodeSamples: RedoclyCodeSampleSchema[] = [
        ...redoclyCodeSamplesCamelCase,
        ...redoclyCodeSamplesKebabCase
    ];

    if (redoclyCodeSamples.length > 0) {
        exampleEndpointCalls.push({
            "code-samples": redoclyCodeSamples.map(
                (value): FernOpenapiIr.CustomCodeSample =>
                    FernOpenapiIr.CustomCodeSample.language({
                        name: value.label ?? value.lang,
                        language: value.lang,
                        code: value.source,
                        install: undefined,
                        description: undefined
                    })
            )
        });
    }

    return exampleEndpointCalls;
}
