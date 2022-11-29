import { BaseContext } from "./BaseContext";
import { ErrorReferencingContextMixin, ErrorSchemaReferencingContextMixin } from "./mixins";
import { TypeReferencingContextMixin } from "./mixins/TypeReferencingContextMixin";
import { TypeSchemaReferencingContextMixin } from "./mixins/TypeSchemaReferencingContextMixin";

export interface ErrorSchemaContext
    extends BaseContext,
        TypeReferencingContextMixin,
        TypeSchemaReferencingContextMixin,
        ErrorReferencingContextMixin,
        ErrorSchemaReferencingContextMixin {}
