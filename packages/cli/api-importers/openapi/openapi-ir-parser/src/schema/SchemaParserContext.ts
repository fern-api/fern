import type { Logger } from "@fern-api/logger";
import type { SchemaId, SdkGroupName } from "@fern-api/openapi-ir";
import type { OpenAPIV3 } from "openapi-types";

import type { ParseOpenAPIOptions } from "../options.js";

export interface SchemaParserContext {
    logger: Logger;
    DUMMY: SchemaParserContext;
    options: ParseOpenAPIOptions;

    referenceExists(ref: string): boolean;
    resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject;
    resolveGroupName(groupName: SdkGroupName): SdkGroupName;
    markSchemaAsReferencedByNonRequest(schemaId: SchemaId): void;
    markSchemaAsReferencedByRequest(schemaId: SchemaId): void;
    markReferencedByDiscriminatedUnion(schema: OpenAPIV3.ReferenceObject, discriminant: string, times: number): void;

    // Schemas marked with a discriminant value will have their discriminants
    // added as explicitly defaulted literal fields
    markSchemaWithDiscriminantValue(
        schema: OpenAPIV3.ReferenceObject,
        discriminant: string,
        discriminantValue: string
    ): void;

    /**
     * Looks up which namespace (if any) contains the given schema ID.
     * Returns undefined if schema is in rootSchemas or doesn't exist.
     * This is useful when a schema is assigned (usually via overrides) a different namespace than its context.
     */
    getNamespace(schemaId: SchemaId): string | undefined;
}
