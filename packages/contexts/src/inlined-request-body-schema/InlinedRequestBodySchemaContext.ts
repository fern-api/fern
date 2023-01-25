import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithRequestWrapperContextMixin } from "../request-wrapper/RequestWrapperContextMixin";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithInlinedRequestBodySchemaContextMixin } from "./InlinedRequestBodySchemaContextMixin";

export interface InlinedRequestBodySchemaContext
    extends WithBaseContextMixin,
        WithRequestWrapperContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithInlinedRequestBodySchemaContextMixin {}
