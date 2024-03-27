import { Logger } from "@fern-api/logger";
import { SchemaId } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";

export interface SchemaParserContext {
    logger: Logger;
    DUMMY: SchemaParserContext;

    resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject;
    markSchemaAsReferencedByNonRequest(schemaId: SchemaId): void;
    markSchemaAsReferencedByRequest(schemaId: SchemaId): void;
    markReferencedByDiscriminatedUnion(schema: OpenAPIV3.ReferenceObject, discrminant: string, times: number): void;
}
