import { BaseContext } from "./BaseContext";
import { TypeReferencingContextMixin } from "./mixins/TypeReferencingContextMixin";

export interface ErrorContext extends BaseContext, TypeReferencingContextMixin {}
