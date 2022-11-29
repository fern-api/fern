import { BaseContext } from "./BaseContext";
import {
    EndpointTypesReferencingContextMixin,
    ErrorReferencingContextMixin,
    TypeReferencingContextMixin,
} from "./mixins";

export interface EndpointTypesContext
    extends BaseContext,
        TypeReferencingContextMixin,
        ErrorReferencingContextMixin,
        EndpointTypesReferencingContextMixin {}
