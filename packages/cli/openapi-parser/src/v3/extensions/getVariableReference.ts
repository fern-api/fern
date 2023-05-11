import { OpenAPIV3 } from "openapi-types";
import { X_FERN_SDK_VARIABLE } from "./extensions";

export function getVariableReference(parameter: OpenAPIV3.ParameterObject): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (parameter as any)[X_FERN_SDK_VARIABLE] as undefined | string;
}
