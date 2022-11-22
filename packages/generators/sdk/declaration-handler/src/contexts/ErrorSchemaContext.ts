import { GeneratedError } from "../generated-types/GeneratedError";
import { BaseContext } from "./BaseContext";
import { TypeReferencingContextMixin } from "./mixins/TypeReferencingContextMixin";
import { TypeSchemaReferencingContextMixin } from "./mixins/TypeSchemaReferencingContextMixin";

export interface ErrorSchemaContext
    extends BaseContext,
        TypeReferencingContextMixin,
        TypeSchemaReferencingContextMixin {
    getErrorBeingGenerated: () => GeneratedError;
}
