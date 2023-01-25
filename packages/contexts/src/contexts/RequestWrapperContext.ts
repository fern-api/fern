import {
    WithBaseContextMixin,
    WithEndpointErrorUnionContextMixin,
    WithRequestWrapperContextMixin,
    WithSdkErrorContextMixin,
    WithTypeContextMixin,
} from "./mixins";

export interface RequestWrapperContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithSdkErrorContextMixin,
        WithEndpointErrorUnionContextMixin,
        WithRequestWrapperContextMixin {}
