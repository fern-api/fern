import { Logger } from "@fern-api/logger";
import { OpenAPIV3 } from "openapi-types";

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
    if (fallback && typeof fallback === "number") {
        return fallback;
    } else if (fallback) {
        logger.warn(`Expected fallback to be a number, but got ${typeof fallback}`);
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
    if (fallback && typeof fallback === "boolean") {
        return fallback;
    } else if (fallback) {
        logger.warn(`Expected fallback to be a boolean, but got ${typeof fallback}`);
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
    if (fallback && typeof fallback === "string") {
        return fallback;
    } else if (fallback) {
        logger.warn(`Expected fallback to be a string, but got ${typeof fallback}`);
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
    if (fallback && Array.isArray(fallback)) {
        return fallback;
    } else if (fallback) {
        logger.warn(`Expected fallback to be a array, but got ${typeof fallback}`);
    }
    return undefined;
}
