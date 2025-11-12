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

function isUrl(ref: string): boolean {
    return ref.startsWith("http://") || ref.startsWith("https://");
}

async function maybeResolveCodeReference(code: unknown, baseDir: string | undefined): Promise<string | undefined> {
    if (code == null) {
        return undefined;
    }

    if (typeof code === "string") {
        return code;
    }

    if (isCodeReference(code)) {
        if (isUrl(code.$ref)) {
            try {
                const response = await fetch(code.$ref);
                if (!response.ok) {
                    return undefined;
                }
                const content = await response.text();
                return content;
            } catch (error) {
                return undefined;
            }
        }

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

async function resolveCodeSamples(
    codeSamples: unknown,
    baseDir: string | undefined
): Promise<RawSchemas.ExampleCodeSampleSchema[]> {
    if (!Array.isArray(codeSamples)) {
        return [];
    }

    const resolved: RawSchemas.ExampleCodeSampleSchema[] = [];
    for (const sample of codeSamples) {
        if (!isPlainObject(sample)) {
            continue;
        }

        const sampleRecord = sample as Record<string, unknown>;
        const code = await maybeResolveCodeReference(sampleRecord.code, baseDir);
        if (code != null) {
            resolved.push({
                ...sample,
                code
            } as RawSchemas.ExampleCodeSampleSchema);
        }
    }

    return resolved;
}

export async function getExamplesFromExtension(
    operationContext: OperationContext,
    operationObject: OpenAPIV3.OperationObject,
    context: AbstractOpenAPIV3ParserContext
): Promise<EndpointExample[]> {
    const exampleEndpointCalls = getExtension<RawSchemas.ExampleEndpointCallSchema[]>(
        operationObject,
        FernOpenAPIExtension.EXAMPLES
    );

    const baseDir = context.source.type === "openapi" ? dirname(context.source.file) : undefined;

    const resolvedExamples = await Promise.all(
        (exampleEndpointCalls ?? []).map(async (example) => {
            if (!isPlainObject(example)) {
                return example;
            }

            const exampleRecord = example as Record<string, unknown>;
            const codeSamples = exampleRecord["code-samples"];
            if (codeSamples != null) {
                const resolvedCodeSamples = await resolveCodeSamples(codeSamples, baseDir);
                return {
                    ...example,
                    "code-samples": resolvedCodeSamples
                };
            }

            return example;
        })
    );

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
