import {
    WithBaseContextMixin,
    WithEndpointTypesContextMixin,
    WithRequestWrapperContextMixin,
    WithSdkErrorContextMixin,
    WithTypeContextMixin,
} from "./mixins";

export interface RequestWrapperContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithSdkErrorContextMixin,
        WithEndpointTypesContextMixin,
        WithRequestWrapperContextMixin {}
