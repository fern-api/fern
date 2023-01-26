import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithExpressInlinedRequestBodyContextMixin } from "../express-inlined-request-body/ExpressInlinedRequestBodyContextMixin";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithExpressInlinedRequestBodySchemaContextMixin } from "./ExpressInlinedRequestBodySchemaContextMixin";

export interface ExpressInlinedRequestBodySchemaContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithExpressInlinedRequestBodyContextMixin,
        WithExpressInlinedRequestBodySchemaContextMixin {}
