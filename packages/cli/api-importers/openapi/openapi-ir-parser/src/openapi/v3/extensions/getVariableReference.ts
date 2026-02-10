import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

export function getVariableReference(parameter: OpenAPIV3.ParameterObject): string | undefined {
    return getExtension<string>(parameter, FernOpenAPIExtension.SDK_VARIABLE);
}
