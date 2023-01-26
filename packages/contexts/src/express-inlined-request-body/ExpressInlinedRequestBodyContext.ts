import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithExpressInlinedRequestBodyContextMixin } from "./ExpressInlinedRequestBodyContextMixin";

export interface ExpressInlinedRequestBodyContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithExpressInlinedRequestBodyContextMixin {}
