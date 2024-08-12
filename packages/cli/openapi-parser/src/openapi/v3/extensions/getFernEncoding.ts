import { Logger } from "@fern-api/logger";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { getExtensionAndValidate } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getFernEncoding({
    schema,
    logger
}: {
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    logger: Logger;
}): RawSchemas.EncodingSchema | undefined {
    return (
        getExtensionAndValidate(schema, FernOpenAPIExtension.ENCODING, RawSchemas.EncodingSchema, logger) ?? undefined
    );
}
