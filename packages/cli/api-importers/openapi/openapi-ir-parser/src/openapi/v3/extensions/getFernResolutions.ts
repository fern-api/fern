import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

export interface FernResolutionSchema {
    name: string;
    resolutions: string[];
}

export function getFernResolutions(openapi: OpenAPIV3.Document): FernResolutionSchema[] | undefined {
    return getExtension<FernResolutionSchema[]>(openapi, FernOpenAPIExtension.RESOLUTIONS);
}
