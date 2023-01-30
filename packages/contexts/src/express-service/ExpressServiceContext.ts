import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithExpressEndpointTypeSchemasContextMixin } from "../express-endpoint-type-schemas";
import { WithExpressErrorContextMixin } from "../express-error";
import { WithExpressInlinedRequestBodyContextMixin } from "../express-inlined-request-body";
import { WithExpressInlinedRequestBodySchemaContextMixin } from "../express-inlined-request-body-schema";
import { WithGenericAPIExpressErrorContextMixin } from "../generic-api-express-error";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithExpressServiceContextMixin } from "./ExpressServiceContextMixin";

export interface ExpressServiceContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithExpressErrorContextMixin,
        WithExpressInlinedRequestBodyContextMixin,
        WithExpressInlinedRequestBodySchemaContextMixin,
        WithExpressEndpointTypeSchemasContextMixin,
        WithExpressServiceContextMixin,
        WithGenericAPIExpressErrorContextMixin {}
