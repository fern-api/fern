import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export function getParameterName(parameter: OpenAPIV3.ParameterObject): string | undefined {
    return getExtension<string>(parameter, FernOpenAPIExtension.PARAMETER_NAME);
}
