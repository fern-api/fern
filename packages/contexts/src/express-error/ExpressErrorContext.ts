import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithExpressErrorSchemaContextMixin } from "../express-error-schema";
import { WithGenericAPIExpressErrorContextMixin } from "../generic-api-express-error";
import { WithTypeSchemaContextMixin } from "../type-schema";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithExpressErrorContextMixin } from "./ExpressErrorContextMixin";

export interface ExpressErrorContext
    extends WithBaseContextMixin,
        WithExpressErrorContextMixin,
        WithExpressErrorSchemaContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithGenericAPIExpressErrorContextMixin {}
