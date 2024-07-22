import { OpenAPIV3 } from "openapi-types";

export function getExampleAsNumber(schema: OpenAPIV3.SchemaObject, exampleUnderride?: number): number | undefined {
    if (schema.example != null && typeof schema.example === "number") {
        return schema.example;
    }
    if (exampleUnderride && typeof exampleUnderride !== "number") {
        // eslint-disable-next-line no-console
        console.warn(`Expected exampleUnderride to be a number, but got ${typeof exampleUnderride}`);
        return undefined;
    }
    return exampleUnderride;
}

export function getExampleAsBoolean(schema: OpenAPIV3.SchemaObject, exampleUnderride?: boolean): boolean | undefined {
    if (schema.example != null && typeof schema.example === "boolean") {
        return schema.example;
    }
    if (exampleUnderride && typeof exampleUnderride !== "boolean") {
        // eslint-disable-next-line no-console
        console.warn(`Expected exampleUnderride to be a boolean, but got ${typeof exampleUnderride}`);
        return undefined;
    }
    return exampleUnderride;
}

export function getExamplesString(schema: OpenAPIV3.SchemaObject, exampleUnderride?: string): string | undefined {
    if (schema.example != null && typeof schema.example === "string") {
        return schema.example;
    }
    if (exampleUnderride && typeof exampleUnderride !== "string") {
        // eslint-disable-next-line no-console
        console.warn(`Expected exampleUnderride to be a string, but got ${typeof exampleUnderride}`);
        return undefined;
    }
    return exampleUnderride;
}

export function getExampleAsArray(schema: OpenAPIV3.SchemaObject, exampleUnderride?: unknown[]): unknown[] | undefined {
    if (schema.example != null && Array.isArray(schema.example)) {
        return schema.example;
    }
    if (exampleUnderride && !Array.isArray(exampleUnderride)) {
        // eslint-disable-next-line no-console
        console.warn(`Expected exampleUnderride to be a array, but got ${typeof exampleUnderride}`);
        return undefined;
    }
    return exampleUnderride;
}
