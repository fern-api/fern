import {
    WithBaseContextMixin,
    WithInlinedRequestBodySchemaContextMixin,
    WithRequestWrapperContextMixin,
    WithTypeContextMixin,
    WithTypeSchemaContextMixin,
} from "./mixins";

export interface InlinedRequestBodySchemaContext
    extends WithBaseContextMixin,
        WithRequestWrapperContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithInlinedRequestBodySchemaContextMixin {}
