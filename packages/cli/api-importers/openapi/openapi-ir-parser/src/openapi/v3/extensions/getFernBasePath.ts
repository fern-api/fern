import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getFernBasePath(parameter: OpenAPIV3.Document): string | undefined {
    return getExtension<string>(parameter, FernOpenAPIExtension.BASE_PATH);
}
