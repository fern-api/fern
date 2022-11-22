import { BaseContext } from "./BaseContext";
import { TypeReferencingContextMixin } from "./mixins/TypeReferencingContextMixin";

export interface TypeContext extends BaseContext, TypeReferencingContextMixin {}
