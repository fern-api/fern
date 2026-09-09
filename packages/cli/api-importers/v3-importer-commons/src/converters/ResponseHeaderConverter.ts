import { MediaType } from "@fern-api/core-utils";
import { HttpHeader, PrimitiveTypeV2, TypeReference, V2SchemaExamples } from "@fern-api/ir-sdk";
import { OpenAPIV3_1 } from "openapi-types";

import { AbstractConverter } from "../AbstractConverter.js";
import { AbstractConverterContext } from "../AbstractConverterContext.js";
import { ExampleConverter } from "./ExampleConverter.js";
import { SchemaConverter } from "./schema/SchemaConverter.js";
import { SchemaOrReferenceConverter } from "./schema/SchemaOrReferenceConverter.js";

export declare namespace ResponseHeaderConverter {
    export interface Args extends AbstractConverter.AbstractArgs {
        /** The `headers` map from an OpenAPI Response Object. */
        headers: Record<string, OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.HeaderObject> | undefined;
    }

    export interface Output {
        headers: HttpHeader[];
        inlinedTypes: Record<string, SchemaConverter.ConvertedSchema>;
    }
}

/**
 * Converts an OpenAPI Response Object's `headers` map into IR `HttpHeader`s. Header value
 * schemas go through {@link SchemaOrReferenceConverter} — the same path as request-header
 * parameters — so object, enum, array, and `$ref` schemas keep their shape and render as
 * expandable schema properties in docs instead of collapsing to `optional<string>`.
 */
export function convertResponseHeaders({
    context,
    breadcrumbs,
    headers: responseHeaders
}: ResponseHeaderConverter.Args): ResponseHeaderConverter.Output {
    const headers: HttpHeader[] = [];
    const inlinedTypes: Record<string, SchemaConverter.ConvertedSchema> = {};
    const headerBreadcrumbs = breadcrumbs ?? [];

    if (responseHeaders == null) {
        return { headers, inlinedTypes };
    }

    for (const [headerName, headerOrRef] of Object.entries(responseHeaders)) {
        const resolvedHeader = context.resolveMaybeReference<OpenAPIV3_1.HeaderObject>({
            schemaOrReference: headerOrRef,
            breadcrumbs: [...headerBreadcrumbs, "headers", headerName]
        });

        if (resolvedHeader == null) {
            continue;
        }

        const headerSchema = getHeaderSchema({ context, header: resolvedHeader });
        let valueType: TypeReference = AbstractConverter.OPTIONAL_STRING;
        let resolvedSchema: OpenAPIV3_1.SchemaObject | undefined;
        // Availability comes from the Header Object itself (`deprecated` /
        // `x-fern-availability`), matching how request-header parameters read it from the
        // Parameter Object — the value schema's availability belongs to that schema.
        const availability = context.getAvailability({
            node: resolvedHeader,
            breadcrumbs: [...headerBreadcrumbs, "headers", headerName]
        });

        if (headerSchema != null) {
            resolvedSchema = context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                schemaOrReference: headerSchema,
                breadcrumbs: [...headerBreadcrumbs, "headers", headerName, "schema"]
            });

            if (resolvedSchema?.type === "number" || resolvedSchema?.type === "integer") {
                valueType = TypeReference.primitive({
                    v1: resolvedSchema.type === "integer" ? "INTEGER" : "DOUBLE",
                    v2:
                        resolvedSchema.type === "integer"
                            ? PrimitiveTypeV2.integer({ default: undefined, validation: undefined })
                            : PrimitiveTypeV2.double({ default: undefined, validation: undefined })
                });
            } else if (resolvedSchema?.type === "boolean") {
                valueType = TypeReference.primitive({
                    v1: "BOOLEAN",
                    v2: PrimitiveTypeV2.boolean({ default: undefined })
                });
            } else {
                const convertedHeaderSchema = new SchemaOrReferenceConverter({
                    context,
                    breadcrumbs: [...headerBreadcrumbs, "headers", headerName, "schema"],
                    schemaOrReference: headerSchema,
                    wrapAsOptional: true,
                    schemaIdOverride: context.convertBreadcrumbsToName([...headerBreadcrumbs, "headers", headerName])
                }).convert();
                if (convertedHeaderSchema != null) {
                    valueType = convertedHeaderSchema.type;
                    for (const [typeId, inlinedType] of Object.entries(convertedHeaderSchema.inlinedTypes)) {
                        inlinedTypes[typeId] = inlinedType;
                    }
                }
            }
        }

        const v2Examples = convertHeaderExamples({
            context,
            breadcrumbs: headerBreadcrumbs,
            header: resolvedHeader,
            headerName,
            schema: headerSchema
        });

        headers.push({
            name: context.casingsGenerator.generateNameAndWireValue({
                name: headerName,
                wireValue: headerName
            }),
            docs: resolvedHeader.description,
            valueType,
            env: undefined,
            v2Examples,
            availability,
            clientDefault: undefined,
            defaultValue: resolvedSchema?.default
        });
    }

    return { headers, inlinedTypes };
}

/**
 * Resolves the schema describing the response header's value. Headers normally declare
 * `schema` directly, but the OpenAPI spec also allows a `content` map for values serialized
 * in a media type — most commonly a JSON-encoded object. Mirrors the request-header
 * handling in `ParameterConverter`.
 */
function getHeaderSchema({
    context,
    header
}: {
    context: AbstractConverterContext<object>;
    header: OpenAPIV3_1.HeaderObject;
}): OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined {
    if (header.schema != null) {
        return header.schema;
    }
    if (!context.settings.respectParameterContent || header.content == null) {
        return undefined;
    }
    for (const [contentType, mediaTypeObject] of Object.entries(header.content)) {
        if (mediaTypeObject.schema != null && MediaType.parse(contentType)?.isJSON()) {
            return mediaTypeObject.schema;
        }
    }
    return undefined;
}

function convertHeaderExamples({
    context,
    breadcrumbs,
    header,
    headerName,
    schema
}: {
    context: AbstractConverterContext<object>;
    breadcrumbs: string[];
    header: OpenAPIV3_1.HeaderObject;
    headerName: string;
    schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;
}): V2SchemaExamples {
    const v2Examples: V2SchemaExamples = {
        userSpecifiedExamples: {},
        autogeneratedExamples: {}
    };

    const headerExample = header.example;
    const headerExamples = header.examples;

    for (const [key, example] of Object.entries(headerExamples ?? {})) {
        const resolvedExample = context.resolveExampleWithValue(example);
        if (resolvedExample != null) {
            v2Examples.userSpecifiedExamples[key] = generateHeaderExample({
                context,
                breadcrumbs,
                schema,
                example: resolvedExample
            });
        }
    }

    if (headerExample != null) {
        const exampleName = context.generateUniqueName({
            prefix: `${headerName}_example`,
            existingNames: Object.keys(v2Examples.userSpecifiedExamples)
        });
        v2Examples.userSpecifiedExamples[exampleName] = generateHeaderExample({
            context,
            breadcrumbs,
            schema,
            example: headerExample
        });
    }

    if (Object.keys(v2Examples.userSpecifiedExamples).length === 0 && schema != null) {
        const exampleName = `${headerName}_example`;
        v2Examples.autogeneratedExamples[exampleName] = generateHeaderExample({
            context,
            breadcrumbs,
            schema,
            example: undefined,
            ignoreErrors: true
        });
    }

    return v2Examples;
}

function generateHeaderExample({
    context,
    breadcrumbs,
    schema,
    example,
    ignoreErrors
}: {
    context: AbstractConverterContext<object>;
    breadcrumbs: string[];
    schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;
    example: unknown;
    ignoreErrors?: boolean;
}): unknown {
    if (schema == null) {
        return example;
    }

    const exampleConverter = new ExampleConverter({
        breadcrumbs,
        context,
        schema,
        example
    });
    const { validExample: convertedExample, errors } = exampleConverter.convert();
    if (!ignoreErrors) {
        errors.forEach((error) => {
            context.errorCollector.collect({
                message: error.message,
                path: error.path
            });
        });
    }
    return convertedExample;
}
