import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export function getVariableReference(parameter: OpenAPIV3.ParameterObject): string | undefined {
    return getExtension<string>(parameter, FernOpenAPIExtension.SDK_VARIABLE);
}
