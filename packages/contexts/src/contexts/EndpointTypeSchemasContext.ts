import {
    WithBaseContextMixin,
    WithEndpointErrorUnionContextMixin,
    WithEndpointTypeSchemasContextMixin,
    WithRequestWrapperContextMixin,
    WithSdkErrorContextMixin,
    WithSdkErrorSchemaContextMixin,
    WithTypeContextMixin,
    WithTypeSchemaContextMixin,
} from "./mixins";

export interface EndpointTypeSchemasContext
    extends WithBaseContextMixin,
        WithEndpointErrorUnionContextMixin,
        WithRequestWrapperContextMixin,
        WithEndpointTypeSchemasContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithSdkErrorContextMixin,
        WithSdkErrorSchemaContextMixin {}
