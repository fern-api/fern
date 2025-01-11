import { OpenAPIV3 } from "openapi-types";

import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Logger } from "@fern-api/logger";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getFernEncoding({
    schema,
    logger
}: {
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    logger: Logger;
}): RawSchemas.EncodingSchema | undefined {
    return getExtension(schema, FernOpenAPIExtension.ENCODING) ?? undefined;
}
