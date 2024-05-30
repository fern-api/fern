import { generatorsYml } from "@fern-api/configuration";
import { Logger } from "@fern-api/logger";
import { SchemaId } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";

export interface SchemaParserContext {
    logger: Logger;
    DUMMY: SchemaParserContext;

    sdkLanguage: generatorsYml.GenerationLanguage | undefined;
    shouldUseTitleAsName: boolean;

    referenceExists(ref: string): boolean;
    resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject;
    markSchemaAsReferencedByNonRequest(schemaId: SchemaId): void;
    markSchemaAsReferencedByRequest(schemaId: SchemaId): void;
    markReferencedByDiscriminatedUnion(schema: OpenAPIV3.ReferenceObject, discrminant: string, times: number): void;

    shouldUseUndiscriminatedUnionsForDiscriminated: boolean;
    getShouldUseUndiscriminatedUnionsForDiscriminated(): boolean;
    storeDiscriminatedUnionMetadata(
        schema: OpenAPIV3.ReferenceObject,
        discrminant: string,
        discriminantValue: string
    ): void;
}
