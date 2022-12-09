import {
    WithBaseContextMixin,
    WithEndpointTypeSchemasContextMixin,
    WithEndpointTypesContextMixin,
    WithEnvironmentsContextMixin,
    WithErrorContextMixin,
    WithErrorSchemaContextMixin,
    WithServiceContextMixin,
    WithTypeContextMixin,
    WithTypeSchemaContextMixin,
} from "./mixins";

export interface ServiceContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithErrorContextMixin,
        WithErrorSchemaContextMixin,
        WithServiceContextMixin,
        WithEndpointTypesContextMixin,
        WithEndpointTypeSchemasContextMixin,
        WithEnvironmentsContextMixin {}
