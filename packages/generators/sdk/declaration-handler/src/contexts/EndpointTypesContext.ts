import {
    WithBaseContextMixin,
    WithEndpointTypesContextMixin,
    WithErrorContextMixin,
    WithTypeContextMixin,
} from "./mixins";

export interface EndpointTypesContext
    extends WithBaseContextMixin,
        WithEndpointTypesContextMixin,
        WithTypeContextMixin,
        WithErrorContextMixin {}
