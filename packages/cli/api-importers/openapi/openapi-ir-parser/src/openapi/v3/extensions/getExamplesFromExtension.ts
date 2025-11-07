import { isPlainObject } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { EndpointExample } from "@fern-api/openapi-ir";
import { existsSync, readFileSync } from "fs";
import { OpenAPIV3 } from "openapi-types";
import { dirname, resolve as resolvePath } from "path";

import { getExtension, getExtensionAndValidate } from "../../../getExtension";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { OperationContext } from "../converters/contexts";
import { RedoclyCodeSampleArraySchema, RedoclyCodeSampleSchema } from "../schemas/RedoclyCodeSampleSchema";
import { OpenAPIExtension } from "./extensions";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getRawReadmeCodeSamples } from "./getReadmeCodeSamples";

interface CodeReference {
    $ref: string;
}

function isCodeReference(value: unknown): value is CodeReference {
    return isPlainObject(value) && typeof (value as { $ref?: unknown }).$ref === "string";
}

function maybeResolveCodeReference(code: unknown, baseDir: string | undefined): string | undefined {
    if (code == null) {
        return undefined;
    }

    if (typeof code === "string") {
        return code;
    }

    if (isCodeReference(code)) {
        const resolvedPath = resolvePath(baseDir ?? process.cwd(), code.$ref);
        if (existsSync(resolvedPath)) {
            try {
                const fileContent = readFileSync(resolvedPath, "utf-8");
                return fileContent;
            } catch (error) {
                return undefined;
            }
        }
    }

    return undefined;
}

function resolveCodeSamples(codeSamples: unknown, baseDir: string | undefined): RawSchemas.ExampleCodeSampleSchema[] {
    if (!Array.isArray(codeSamples)) {
        return [];
    }

    const resolved: RawSchemas.ExampleCodeSampleSchema[] = [];
    for (const sample of codeSamples) {
        if (!isPlainObject(sample)) {
            continue;
        }

        const sampleRecord = sample as Record<string, unknown>;
        const code = maybeResolveCodeReference(sampleRecord.code, baseDir);
        if (code != null) {
            resolved.push({
                ...sample,
                code
            } as RawSchemas.ExampleCodeSampleSchema);
        }
    }

    return resolved;
}

export function getExamplesFromExtension(
    operationContext: OperationContext,
    operationObject: OpenAPIV3.OperationObject,
    context: AbstractOpenAPIV3ParserContext
): EndpointExample[] {
    const exampleEndpointCalls = getExtension<RawSchemas.ExampleEndpointCallSchema[]>(
        operationObject,
        FernOpenAPIExtension.EXAMPLES
    );

    const baseDir = context.source.type === "openapi" ? dirname(context.source.file) : undefined;

    const resolvedExamples = (exampleEndpointCalls ?? []).map((example) => {
        if (!isPlainObject(example)) {
            return example;
        }

        const exampleRecord = example as Record<string, unknown>;
        const codeSamples = exampleRecord["code-samples"];
        if (codeSamples != null) {
            const resolvedCodeSamples = resolveCodeSamples(codeSamples, baseDir);
            return {
                ...example,
                "code-samples": resolvedCodeSamples
            };
        }

        return example;
    });

    const validatedExampleEndpointCalls: RawSchemas.ExampleEndpointCallArraySchema = resolvedExamples.filter(
        (example) => {
            const maybeFernExample = RawSchemas.serialization.ExampleEndpointCallSchema.parse(example);
            if (!maybeFernExample.ok) {
                context.logger.error(
                    `Failed to parse x-fern-example in ${operationContext.path}/${operationContext.method}`
                );
            }
            return maybeFernExample.ok;
        }
    );

    const redoclyCodeSamplesKebabCase =
        getExtensionAndValidate<RedoclyCodeSampleArraySchema>(
            operationObject,
            OpenAPIExtension.REDOCLY_CODE_SAMPLES_KEBAB,
            RedoclyCodeSampleArraySchema,
            context.logger,
            [...operationContext.baseBreadcrumbs, `${operationContext.method} ${operationContext.path}`]
        ) ?? [];

    const redoclyCodeSamplesCamelCase =
        getExtensionAndValidate<RedoclyCodeSampleArraySchema>(
            operationObject,
            OpenAPIExtension.REDOCLY_CODE_SAMPLES_CAMEL,
            RedoclyCodeSampleArraySchema,
            context.logger,
            [...operationContext.baseBreadcrumbs, `${operationContext.method} ${operationContext.path}`]
        ) ?? [];

    const redoclyCodeSamples: RedoclyCodeSampleSchema[] = [
        ...redoclyCodeSamplesCamelCase,
        ...redoclyCodeSamplesKebabCase
    ];

    if (redoclyCodeSamples.length > 0) {
        validatedExampleEndpointCalls.push({
            "code-samples": redoclyCodeSamples.map(
                (value): RawSchemas.ExampleCodeSampleSchema => ({
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
        validatedExampleEndpointCalls.push({
            "code-samples": readmeCodeSamples
        });
    }

    return validatedExampleEndpointCalls.map(EndpointExample.unknown);
}
