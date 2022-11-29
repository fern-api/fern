import { BaseContext } from "./BaseContext";
import { ErrorReferencingContextMixin } from "./mixins";
import { TypeReferencingContextMixin } from "./mixins/TypeReferencingContextMixin";

export interface ErrorContext extends BaseContext, TypeReferencingContextMixin, ErrorReferencingContextMixin {}
