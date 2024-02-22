import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export interface FernResolutionSchema {
    name: string;
    resolutions: string[];
}

export function getFernResolutions(openapi: OpenAPIV3.Document): FernResolutionSchema[] | undefined {
    return getExtension<FernResolutionSchema[]>(openapi, FernOpenAPIExtension.RESOLUTIONS);
}
