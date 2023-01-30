import { Reference } from "@fern-typescript/commons";
import { GeneratedGenericAPIExpressError } from "./GeneratedGenericAPIExpressError";

export interface GenericAPIExpressErrorContextMixin {
    getReferenceToGenericAPIExpressError: () => Reference;
    getGeneratedGenericAPIExpressError: () => GeneratedGenericAPIExpressError;
}

export interface WithGenericAPIExpressErrorContextMixin {
    genericAPIExpressError: GenericAPIExpressErrorContextMixin;
}
