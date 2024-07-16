import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { getExtensionAndValidate } from "../../../getExtension";
import { OpenAPIV3ParserContext } from "../OpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getFernVersion({
    context,
    document
}: {
    context: OpenAPIV3ParserContext;
    document: OpenAPIV3.Document;
}): RawSchemas.VersionDeclarationSchema | undefined {
    return (
        getExtensionAndValidate(
            document,
            FernOpenAPIExtension.FERN_VERSION,
            RawSchemas.VersionDeclarationSchema,
            context
        ) ?? undefined
    );
}
