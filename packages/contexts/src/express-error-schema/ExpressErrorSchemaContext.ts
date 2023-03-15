import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithExpressErrorContextMixin } from "../express-error/ExpressErrorContextMixin";
import { WithGenericAPIExpressErrorContextMixin } from "../generic-api-express-error";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithExpressErrorSchemaContextMixin } from "./ExpressErrorSchemaContextMixin";

export interface ExpressErrorSchemaContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithExpressErrorContextMixin,
        WithExpressErrorSchemaContextMixin,
        WithGenericAPIExpressErrorContextMixin {}
