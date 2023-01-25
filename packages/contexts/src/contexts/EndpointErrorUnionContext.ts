import {
    WithBaseContextMixin,
    WithEndpointErrorUnionContextMixin,
    WithSdkErrorContextMixin,
    WithTypeContextMixin,
} from "./mixins";

export interface EndpointErrorUnionContext
    extends WithBaseContextMixin,
        WithEndpointErrorUnionContextMixin,
        WithTypeContextMixin,
        WithSdkErrorContextMixin {}
