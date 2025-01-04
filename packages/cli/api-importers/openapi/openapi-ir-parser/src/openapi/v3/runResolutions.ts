import { OpenAPIV3 } from "openapi-types";

import { getFernResolutions } from "./extensions/getFernResolutions";

export function runResolutions({ openapi }: { openapi: OpenAPIV3.Document }): OpenAPIV3.Document {
    const resolutions = getFernResolutions(openapi);
    if (resolutions == null) {
        return openapi;
    }

    /**
     * A map of references that have been replaced.
     * This is useful so that we can replace inline
     * references in schemas that have been replaced.
     */
    let replacedReferences: Record<string, string> = {};
    for (const resolution of resolutions) {
        const schemaReference = `#/components/schemas/${resolution.name}`;
        for (const resolutionPath of resolution.resolutions) {
            openapi = addComponentSchema({ openapi, schemaReference: resolutionPath, schemaName: resolution.name });
            openapi = replaceWithSchemaReference({
                openapi,
                replaceReference: resolutionPath,
                schemaReference,
                replacedReferences
            });
            replacedReferences = {
                ...replacedReferences,
                ...Object.fromEntries(resolution.resolutions.map((resolution) => [schemaReference, resolution]))
            };
        }
    }
    return openapi;
}

interface AddComponentSchemaArgs {
    openapi: OpenAPIV3.Document;
    /* A reference to the inlined schema which should be made a comonent schema */
    schemaReference: string;
    /* The name of the schema to be added */
    schemaName: string;
}

function addComponentSchema({ openapi, schemaReference, schemaName }: AddComponentSchemaArgs): OpenAPIV3.Document {
    const keys = schemaReference
        .replace("#/", "")
        .split("/")
        .map((key) => key.replace("~1", "/"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value = openapi as any;
    for (const key of keys) {
        const nextValue = value[key];
        if (nextValue == null) {
            return openapi;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = nextValue as any;
    }

    if (openapi.components == null) {
        openapi.components = {};
    }
    if (openapi.components.schemas == null) {
        openapi.components.schemas = {};
    }

    openapi.components.schemas[schemaName] = value;

    return openapi;
}

interface ReplaceWithReferenceArgs {
    openapi: OpenAPIV3.Document;
    /* A reference to the inlined schema which should be replaced */
    replaceReference: string;
    /* A reference to the schema */
    schemaReference: string;
    /* Any references that have been moved so far */
    replacedReferences: Record<string, string>;
}

function replaceWithSchemaReference({
    openapi,
    replaceReference,
    schemaReference,
    replacedReferences
}: ReplaceWithReferenceArgs): OpenAPIV3.Document {
    const overlappingReference = Object.keys(replacedReferences)
        .filter((replacedReference) => replaceReference.startsWith(replacedReference))
        .sort((a, b) => b.length - a.length)[0];
    if (overlappingReference != null) {
        const resolvedOverlappingReference = replacedReferences[overlappingReference];
        if (resolvedOverlappingReference != null) {
            const newSchemaReference = schemaReference.replace(overlappingReference, resolvedOverlappingReference);
            return replaceWithSchemaReference({
                openapi,
                replaceReference,
                schemaReference: newSchemaReference,
                replacedReferences: {}
            });
        }
    }

    const keys = replaceReference
        .replace("#/", "")
        .split("/")
        .map((key) => key.replace("~1", "/"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value = openapi as any;
    for (const key of keys.slice(0, -1)) {
        const nextValue = value[key];
        if (nextValue == null) {
            return openapi;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = nextValue as any;
    }

    const finalKey = keys[keys.length - 1];
    if (finalKey == null) {
        return openapi;
    }
    value[finalKey] = {
        $ref: schemaReference
    };

    return openapi;
}
