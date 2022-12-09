import { WithBaseContextMixin, WithTypeContextMixin, WithTypeSchemaContextMixin } from "./mixins";

export interface TypeSchemaContext extends WithBaseContextMixin, WithTypeSchemaContextMixin, WithTypeContextMixin {}
