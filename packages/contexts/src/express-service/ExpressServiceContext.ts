import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithExpressEndpointTypeSchemasContextMixin } from "../express-endpoint-type-schemas";
import { WithExpressInlinedRequestBodyContextMixin } from "../express-inlined-request-body";
import { WithExpressInlinedRequestBodySchemaContextMixin } from "../express-inlined-request-body-schema";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithExpressServiceContextMixin } from "./ExpressServiceContextMixin";

export interface ExpressServiceContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithExpressInlinedRequestBodyContextMixin,
        WithExpressInlinedRequestBodySchemaContextMixin,
        WithExpressEndpointTypeSchemasContextMixin,
        WithExpressServiceContextMixin {}
