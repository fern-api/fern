import {
    ExampleHeader,
    ExamplePathParameter,
    ExampleQueryParameter,
    ExampleQueryParameterShape,
    HttpHeader,
    PathParameter,
    QueryParameter,
    TypeDeclaration,
    TypeId
} from "@fern-api/ir-sdk";

import { isTypeReferenceOptional } from "../../utils/isTypeReferenceOptional";
import { ExampleGenerationResult } from "./ExampleGenerationResult";
import { ExampleGenerationCache, generateTypeReferenceExample } from "./generateTypeReferenceExample";

export interface GenerateParamsOptions {
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    skipOptionalRequestProperties: boolean;
    maxDepth?: number;
    cache?: ExampleGenerationCache;
}

/**
 * Generates path-parameter examples.
 */
export function generatePathParameterExamples(
    pathParameters: PathParameter[],
    options: GenerateParamsOptions
): ExampleGenerationResult<ExamplePathParameter[]> {
    const result: ExamplePathParameter[] = [];

    for (const p of pathParameters) {
        const generatedExample = generateTypeReferenceExample({
            fieldName: p.name.originalName,
            currentDepth: 0,
            maxDepth: options.maxDepth ?? 1,
            typeDeclarations: options.typeDeclarations,
            typeReference: p.valueType,
            skipOptionalProperties: options.skipOptionalRequestProperties,
            cache: options.cache
        });
        if (generatedExample.type === "failure") {
            return generatedExample; // short-circuit failure
        }
        result.push({
            name: p.name,
            value: generatedExample.example
        });
    }

    // On success, return the array and no JSON example needed
    return { type: "success", example: result, jsonExample: undefined };
}

/**
 * Generates header examples.
 */
export function generateHeaderExamples(
    headers: HttpHeader[],
    options: GenerateParamsOptions
): ExampleGenerationResult<ExampleHeader[]> {
    const result: ExampleHeader[] = [];

    for (const h of headers) {
        // If it's optional and skipOptionalRequestProperties=true, skip
        if (
            options.skipOptionalRequestProperties &&
            isTypeReferenceOptional({
                typeDeclarations: options.typeDeclarations,
                typeReference: h.valueType
            })
        ) {
            continue;
        }

        const generatedExample = generateTypeReferenceExample({
            fieldName: h.name.name.originalName,
            currentDepth: 0,
            maxDepth: options.maxDepth ?? 1,
            typeDeclarations: options.typeDeclarations,
            typeReference: h.valueType,
            skipOptionalProperties: options.skipOptionalRequestProperties,
            cache: options.cache
        });
        if (generatedExample.type === "failure") {
            return generatedExample;
        }
        result.push({
            name: h.name,
            value: generatedExample.example
        });
    }

    return { type: "success", example: result, jsonExample: undefined };
}

/**
 * Generates query-parameter examples.
 */
export function generateQueryParameterExamples(
    queryParameters: QueryParameter[],
    options: GenerateParamsOptions
): ExampleGenerationResult<ExampleQueryParameter[]> {
    const result: ExampleQueryParameter[] = [];

    for (const q of queryParameters) {
        // skip if optional & skipping optional
        if (
            options.skipOptionalRequestProperties &&
            isTypeReferenceOptional({
                typeDeclarations: options.typeDeclarations,
                typeReference: q.valueType
            })
        ) {
            continue;
        }

        const generatedExample = generateTypeReferenceExample({
            fieldName: q.name.name.originalName,
            currentDepth: 0,
            maxDepth: options.maxDepth ?? 10,
            typeDeclarations: options.typeDeclarations,
            typeReference: q.valueType,
            skipOptionalProperties: options.skipOptionalRequestProperties,
            cache: options.cache
        });

        if (generatedExample.type === "failure") {
            return generatedExample;
        }

        result.push({
            name: q.name,
            shape: q.allowMultiple ? ExampleQueryParameterShape.exploded() : ExampleQueryParameterShape.single(),
            value: generatedExample.example
        });
    }

    return { type: "success", example: result, jsonExample: undefined };
}
