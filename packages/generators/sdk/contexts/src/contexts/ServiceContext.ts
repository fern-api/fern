import {
    WithBaseContextMixin,
    WithEndpointTypeSchemasContextMixin,
    WithEndpointTypesContextMixin,
    WithEnvironmentsContextMixin,
    WithErrorContextMixin,
    WithErrorSchemaContextMixin,
    WithRequestWrapperContextMixin,
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
        WithRequestWrapperContextMixin,
        WithEndpointTypeSchemasContextMixin,
        WithEnvironmentsContextMixin {}
