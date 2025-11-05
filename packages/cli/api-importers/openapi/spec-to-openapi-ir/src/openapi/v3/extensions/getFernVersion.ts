import { RawSchemas } from "@fern-api/fern-definition-schema";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";
import { OpenAPIV3ParserContext } from "../OpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getFernVersion({
    context,
    document
}: {
    context: OpenAPIV3ParserContext;
    document: OpenAPIV3.Document;
}): RawSchemas.VersionDeclarationSchema | undefined {
    return getExtension(document, FernOpenAPIExtension.FERN_VERSION) ?? undefined;
}
