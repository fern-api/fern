import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export function getVariableReference(parameter: OpenAPIV3.ParameterObject): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getExtension<string>(parameter, FernOpenAPIExtension.SDK_VARIABLE);
}
