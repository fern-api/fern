import { Reference } from "@fern-typescript/commons";

import { GeneratedGenericAPIExpressError } from "./GeneratedGenericAPIExpressError.js";

export interface GenericAPIExpressErrorContext {
    getReferenceToGenericAPIExpressError: () => Reference;
    getGeneratedGenericAPIExpressError: () => GeneratedGenericAPIExpressError;
}
