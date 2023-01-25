import {
    WithBaseContextMixin,
    WithEndpointTypesContextMixin,
    WithSdkErrorContextMixin,
    WithTypeContextMixin,
} from "./mixins";

export interface EndpointTypesContext
    extends WithBaseContextMixin,
        WithEndpointTypesContextMixin,
        WithTypeContextMixin,
        WithSdkErrorContextMixin {}
