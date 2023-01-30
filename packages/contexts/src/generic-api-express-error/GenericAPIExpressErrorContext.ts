import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithGenericAPIExpressErrorContextMixin } from "./GenericAPIExpressErrorContextMixin";

export interface GenericAPIExpressErrorContext extends WithBaseContextMixin, WithGenericAPIExpressErrorContextMixin {}
