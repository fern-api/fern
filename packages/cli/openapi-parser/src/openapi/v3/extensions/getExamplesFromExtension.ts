import { AbsoluteFilePath, cwd, doesPathExistSync, resolve } from "@fern-api/fs-utils";
import { EndpointExample } from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { readFileSync } from "fs";
import { OpenAPIV3 } from "openapi-types";
import { getExtensionAndValidate } from "../../../getExtension";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { OperationContext } from "../converters/contexts";
import { RedoclyCodeSampleArraySchema, RedoclyCodeSampleSchema } from "../schemas/RedoclyCodeSampleSchema";
import { OpenAPIExtension } from "./extensions";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getRawReadmeCodeSamples } from "./getReadmeCodeSamples";

function maybeGetReferencedCode(code: string | RawSchemas.ExampleCodeReferenceSchema | undefined): string | undefined {
    if (code == null) {
        return;
    }

    if (typeof code === "string") {
        return code;
    } else {
        const path = resolve(cwd(), code.$ref);
        const pathExists = doesPathExistSync(AbsoluteFilePath.of(path));
        if (pathExists) {
            return readFileSync(path).toString();
        }
    }
    return;
}

function convertRawExamples(examples: RawSchemas.UnresolvedExampleEndpointCallArraySchema): EndpointExample[] {
    return examples
        .map((ex) => ({
            ...ex,
            "code-samples": ex["code-samples"]
                ?.map((cs) => ({
                    ...cs,
                    code: maybeGetReferencedCode(cs.code)
                }))
                .filter((cs): cs is RawSchemas.ExampleCodeSampleSchema => cs.code != null)
        }))
        .map(EndpointExample.unknown);
}

export function getExamplesFromExtension(
    operationContext: OperationContext,
    operationObject: OpenAPIV3.OperationObject,
    context: AbstractOpenAPIV3ParserContext
): EndpointExample[] {
    const exampleEndpointCalls: RawSchemas.UnresolvedExampleEndpointCallArraySchema =
        getExtensionAndValidate(
            operationObject,
            FernOpenAPIExtension.EXAMPLES,
            RawSchemas.UnresolvedExampleEndpointCallArraySchema,
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
                (value): RawSchemas.UnresolvedExampleCodeSampleSchema => ({
                    name: value.label ?? value.lang,
                    language: value.lang,
                    code: value.source,
                    install: undefined,
                    docs: undefined
                })
            )
        });
    }

    const readmeCodeSamples = getRawReadmeCodeSamples(operationObject);
    if (readmeCodeSamples.length > 0) {
        exampleEndpointCalls.push({
            "code-samples": readmeCodeSamples
        });
    }

    return convertRawExamples(exampleEndpointCalls);
}
