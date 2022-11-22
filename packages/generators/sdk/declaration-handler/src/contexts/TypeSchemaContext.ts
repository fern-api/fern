import { GeneratedType } from "../generated-types";
import { BaseContext } from "./BaseContext";
import { TypeReferencingContextMixin } from "./mixins/TypeReferencingContextMixin";
import { TypeSchemaReferencingContextMixin } from "./mixins/TypeSchemaReferencingContextMixin";

export interface TypeSchemaContext extends BaseContext, TypeReferencingContextMixin, TypeSchemaReferencingContextMixin {
    getTypeBeingGenerated: () => GeneratedType;
}
