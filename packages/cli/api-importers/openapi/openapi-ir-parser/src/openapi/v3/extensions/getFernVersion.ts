import { RawSchemas } from "@fern-api/fern-definition-schema";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { OpenAPIV3ParserContext } from "../OpenAPIV3ParserContext.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

export function getFernVersion({
    context,
    document
}: {
    context: OpenAPIV3ParserContext;
    document: OpenAPIV3.Document;
}): RawSchemas.VersionDeclarationSchema | undefined {
    return getExtension(document, FernOpenAPIExtension.FERN_VERSION) ?? undefined;
}
