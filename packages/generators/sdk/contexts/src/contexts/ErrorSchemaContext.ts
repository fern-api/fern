import {
    WithBaseContextMixin,
    WithErrorContextMixin,
    WithErrorSchemaContextMixin,
    WithTypeContextMixin,
    WithTypeSchemaContextMixin,
} from "./mixins";

export interface ErrorSchemaContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithErrorContextMixin,
        WithErrorSchemaContextMixin {}
