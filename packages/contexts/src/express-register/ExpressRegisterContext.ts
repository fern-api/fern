import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithExpressServiceContextMixin } from "../express-service";
import { WithExpressRegisterContextMixin } from "./ExpressRegisterContextMixin";

export interface ExpressRegisterContext
    extends WithBaseContextMixin,
        WithExpressServiceContextMixin,
        WithExpressRegisterContextMixin {}
