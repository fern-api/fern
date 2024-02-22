import { GlobalHeader } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export function getGlobalHeaders(document: OpenAPIV3.Document): GlobalHeader[] | undefined {
    return getExtension<GlobalHeader[]>(document, FernOpenAPIExtension.FERN_GLOBAL_HEADERS);
}
