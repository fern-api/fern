import {
    WithBaseContextMixin,
    WithEndpointTypeSchemasContextMixin,
    WithEndpointTypesContextMixin,
    WithErrorContextMixin,
    WithErrorSchemaContextMixin,
    WithRequestWrapperContextMixin,
    WithTypeContextMixin,
    WithTypeSchemaContextMixin,
} from "./mixins";

export interface EndpointTypeSchemasContext
    extends WithBaseContextMixin,
        WithEndpointTypesContextMixin,
        WithRequestWrapperContextMixin,
        WithEndpointTypeSchemasContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithErrorContextMixin,
        WithErrorSchemaContextMixin {}
