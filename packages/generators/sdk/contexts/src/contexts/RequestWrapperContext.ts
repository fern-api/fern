import {
    WithBaseContextMixin,
    WithEndpointTypesContextMixin,
    WithErrorContextMixin,
    WithRequestWrapperContextMixin,
    WithTypeContextMixin,
} from "./mixins";

export interface RequestWrapperContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithErrorContextMixin,
        WithEndpointTypesContextMixin,
        WithRequestWrapperContextMixin {}
