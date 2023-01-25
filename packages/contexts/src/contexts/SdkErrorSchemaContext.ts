import {
    WithBaseContextMixin,
    WithSdkErrorContextMixin,
    WithSdkErrorSchemaContextMixin,
    WithTypeContextMixin,
    WithTypeSchemaContextMixin,
} from "./mixins";

export interface SdkErrorSchemaContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithSdkErrorContextMixin,
        WithSdkErrorSchemaContextMixin {}
