import { BaseContext } from "./BaseContext";
import {
    EndpointTypeSchemasReferencingContextMixin,
    EndpointTypesReferencingContextMixin,
    ErrorReferencingContextMixin,
    ErrorSchemaReferencingContextMixin,
    TypeReferencingContextMixin,
    TypeSchemaReferencingContextMixin,
} from "./mixins";

export interface EndpointTypeSchemasContext
    extends BaseContext,
        TypeReferencingContextMixin,
        TypeSchemaReferencingContextMixin,
        ErrorReferencingContextMixin,
        ErrorSchemaReferencingContextMixin,
        EndpointTypesReferencingContextMixin,
        EndpointTypeSchemasReferencingContextMixin {}
