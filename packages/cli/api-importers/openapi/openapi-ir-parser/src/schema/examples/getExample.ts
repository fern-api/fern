import { OpenAPIV3 } from "openapi-types";

import { Logger } from "@fern-api/logger";

import { getExtension } from "../../getExtension";
import { getExamples } from "../../openapi/v3/extensions/getExamples";

export function getExampleAsNumber({
    schema,
    logger,
    fallback
}: {
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ParameterObject;
    logger: Logger;
    fallback?: unknown;
}): number | undefined {
    if (schema.example != null && typeof schema.example === "number") {
        return schema.example;
    }
    const examples = getExamples(schema);
    for (const example of examples ?? []) {
        if (typeof example === "number") {
            return example;
        }
    }
    if (fallback && typeof fallback === "number") {
        return fallback;
    }
    return undefined;
}

export function getExampleAsBoolean({
    schema,
    logger,
    fallback
}: {
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ParameterObject;
    logger: Logger;
    fallback?: unknown;
}): boolean | undefined {
    if (schema.example != null && typeof schema.example === "boolean") {
        return schema.example;
    }
    const examples = getExamples(schema);
    for (const example of examples ?? []) {
        if (typeof example === "boolean") {
            return example;
        }
    }
    if (fallback && typeof fallback === "boolean") {
        return fallback;
    }
    return undefined;
}

export function getExamplesString({
    schema,
    logger,
    fallback
}: {
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ParameterObject;
    logger: Logger;
    fallback?: unknown;
}): string | undefined {
    if (schema.example != null && typeof schema.example === "string") {
        return schema.example;
    }
    const examples = getExamples(schema);
    for (const example of examples ?? []) {
        if (typeof example === "string") {
            return example;
        }
    }
    if (fallback && typeof fallback === "string") {
        return fallback;
    }
    return undefined;
}

export function getExampleAsArray({
    schema,
    logger,
    fallback
}: {
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ParameterObject;
    logger: Logger;
    fallback?: unknown;
}): unknown[] | undefined {
    if (schema.example != null && Array.isArray(schema.example)) {
        return schema.example;
    }
    const examples = getExamples(schema);
    for (const example of examples ?? []) {
        if (Array.isArray(example)) {
            return example;
        }
    }
    if (fallback && Array.isArray(fallback)) {
        return fallback;
    }
    return undefined;
}
