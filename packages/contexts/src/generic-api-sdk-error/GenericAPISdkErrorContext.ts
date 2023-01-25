import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithGenericAPISdkErrorContextMixin } from "./GenericAPISdkErrorContextMixin";

export interface GenericAPISdkErrorContext extends WithBaseContextMixin, WithGenericAPISdkErrorContextMixin {}
