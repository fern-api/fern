import {
    WithBaseContextMixin,
    WithEndpointTypeSchemasContextMixin,
    WithEndpointTypesContextMixin,
    WithErrorContextMixin,
    WithErrorSchemaContextMixin,
    WithTypeContextMixin,
    WithTypeSchemaContextMixin,
} from "./mixins";

export interface EndpointTypeSchemasContext
    extends WithBaseContextMixin,
        WithEndpointTypesContextMixin,
        WithEndpointTypeSchemasContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithErrorContextMixin,
        WithErrorSchemaContextMixin {}
