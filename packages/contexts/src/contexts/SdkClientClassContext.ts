import {
    WithBaseContextMixin,
    WithEndpointTypeSchemasContextMixin,
    WithEndpointTypesContextMixin,
    WithEnvironmentsContextMixin,
    WithGenericAPISdkErrorContextMixin,
    WithRequestWrapperContextMixin,
    WithSdkClientClassContextMixin,
    WithSdkErrorContextMixin,
    WithSdkErrorSchemaContextMixin,
    WithTimeoutSdkErrorContextMixin,
    WithTypeContextMixin,
    WithTypeSchemaContextMixin,
} from "./mixins";

export interface SdkClientClassContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithSdkErrorContextMixin,
        WithSdkErrorSchemaContextMixin,
        WithSdkClientClassContextMixin,
        WithEndpointTypesContextMixin,
        WithRequestWrapperContextMixin,
        WithEndpointTypeSchemasContextMixin,
        WithEnvironmentsContextMixin,
        WithGenericAPISdkErrorContextMixin,
        WithTimeoutSdkErrorContextMixin {}
