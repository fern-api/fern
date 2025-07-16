import { Reference } from "@fern-typescript/commons";

import { GeneratedGenericAPIExpressError } from "./GeneratedGenericAPIExpressError";

export interface GenericAPIExpressErrorContext {
    getReferenceToGenericAPIExpressError: () => Reference;
    getGeneratedGenericAPIExpressError: () => GeneratedGenericAPIExpressError;
}
