import { Logger } from "@fern-api/logger";
import { SchemaId } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { ParseOpenAPIOptions } from "../options";

export interface SchemaParserContext {
    logger: Logger;
    DUMMY: SchemaParserContext;
    options: ParseOpenAPIOptions;

    referenceExists(ref: string): boolean;
    resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject;
    markSchemaAsReferencedByNonRequest(schemaId: SchemaId): void;
    markSchemaAsReferencedByRequest(schemaId: SchemaId): void;
    markReferencedByDiscriminatedUnion(schema: OpenAPIV3.ReferenceObject, discrminant: string, times: number): void;

    // Schemas marked with a discriminant value will have their discriminants
    // added as explicitly defaulted literal fields
    markSchemaWithDiscriminantValue(
        schema: OpenAPIV3.ReferenceObject,
        discrminant: string,
        discriminantValue: string
    ): void;
}
