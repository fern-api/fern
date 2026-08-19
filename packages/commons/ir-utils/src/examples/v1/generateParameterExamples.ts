import {
    ExampleHeader,
    ExamplePathParameter,
    ExamplePrimitive,
    ExampleQueryParameter,
    ExampleQueryParameterShape,
    ExampleTypeReferenceShape,
    HttpHeader,
    PathParameter,
    QueryParameter,
    TypeDeclaration,
    TypeId
} from "@fern-api/ir-sdk";
import { isTypeReferenceOptional } from "../../utils/isTypeReferenceOptional.js";
import { getOriginalName } from "../../utils/namesUtils.js";
import { ExampleGenerationResult } from "./ExampleGenerationResult.js";
import { generateTypeReferenceExample } from "./generateTypeReferenceExample.js";

export interface GenerateParamsOptions {
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    skipOptionalRequestProperties: boolean;
    maxDepth?: number; // optional: let each function pass a default
}

/**
 * Generates path-parameter examples.
 *
 * Path parameters are always scalar URL segments, so the generated example
 * must be a primitive value (string, number, or boolean).  When the
 * underlying type resolves to an object or array (e.g. `unknown` -> `{ key: "value" }`),
 * we fall back to a descriptive string derived from the parameter name.
 */
export function generatePathParameterExamples(
    pathParameters: PathParameter[],
    options: GenerateParamsOptions
): ExampleGenerationResult<ExamplePathParameter[]> {
    const result: ExamplePathParameter[] = [];

    for (const p of pathParameters) {
        const generatedExample = generateTypeReferenceExample({
            fieldName: getOriginalName(p.name),
            currentDepth: 0,
            maxDepth: options.maxDepth ?? 1,
            typeDeclarations: options.typeDeclarations,
            typeReference: p.valueType,
            skipOptionalProperties: options.skipOptionalRequestProperties
        });
        if (generatedExample.type === "failure") {
            return generatedExample; // short-circuit failure
        }

        // Path parameters must be scalar URL segments.  If the generated
        // example is a non-primitive (object / array), replace it with a
        // string value so the URL is well-formed.
        const json = generatedExample.example.jsonExample;
        if (typeof json !== "string" && typeof json !== "number" && typeof json !== "boolean") {
            const fallback = getOriginalName(p.name);
            result.push({
                name: p.name,
                value: {
                    jsonExample: fallback,
                    shape: ExampleTypeReferenceShape.primitive(ExamplePrimitive.string({ original: fallback }))
                }
            });
        } else {
            result.push({
                name: p.name,
                value: generatedExample.example
            });
        }
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
            fieldName: getOriginalName(h.name),
            currentDepth: 0,
            maxDepth: options.maxDepth ?? 1,
            typeDeclarations: options.typeDeclarations,
            typeReference: h.valueType,
            skipOptionalProperties: options.skipOptionalRequestProperties
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
            fieldName: getOriginalName(q.name),
            currentDepth: 0,
            maxDepth: options.maxDepth ?? 10,
            typeDeclarations: options.typeDeclarations,
            typeReference: q.valueType,
            skipOptionalProperties: options.skipOptionalRequestProperties
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
