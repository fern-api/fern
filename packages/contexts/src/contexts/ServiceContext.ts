import {
    WithBaseContextMixin,
    WithEndpointTypeSchemasContextMixin,
    WithEndpointTypesContextMixin,
    WithEnvironmentsContextMixin,
    WithErrorContextMixin,
    WithErrorSchemaContextMixin,
    WithGenericAPIErrorContextMixin,
    WithRequestWrapperContextMixin,
    WithServiceContextMixin,
    WithTimeoutErrorContextMixin,
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
        WithEnvironmentsContextMixin,
        WithGenericAPIErrorContextMixin,
        WithTimeoutErrorContextMixin {}
