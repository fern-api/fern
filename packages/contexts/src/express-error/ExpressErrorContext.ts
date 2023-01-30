import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithGenericAPIExpressErrorContextMixin } from "../generic-api-express-error";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithExpressErrorContextMixin } from "./ExpressErrorContextMixin";

export interface ExpressErrorContext
    extends WithBaseContextMixin,
        WithExpressErrorContextMixin,
        WithTypeContextMixin,
        WithGenericAPIExpressErrorContextMixin {}
