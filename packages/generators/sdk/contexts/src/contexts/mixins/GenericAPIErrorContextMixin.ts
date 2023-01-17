import { GeneratedGenericAPIError } from "../../generated-types";
import { Reference } from "../../Reference";

export interface GenericAPIErrorContextMixin {
    getReferenceToGenericAPIError: () => Reference;
    getGeneratedGenericAPIError: () => GeneratedGenericAPIError;
}

export interface WithGenericAPIErrorContextMixin {
    genericAPIError: GenericAPIErrorContextMixin;
}
