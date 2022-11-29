import { GeneratedEndpointTypes } from "../generated-types";
import { Reference } from "../Reference";
import { BaseContext } from "./BaseContext";
import {
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
        ErrorSchemaReferencingContextMixin {
    getEndpointTypesBeingGenerated: () => GeneratedEndpointTypes;
    getReferenceToEndpointTypeExport: (export_: string | string[]) => Reference;
}
