import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithTypeSchemaContextMixin } from "./TypeSchemaContextMixin";

export interface TypeSchemaContext extends WithBaseContextMixin, WithTypeSchemaContextMixin, WithTypeContextMixin {}
