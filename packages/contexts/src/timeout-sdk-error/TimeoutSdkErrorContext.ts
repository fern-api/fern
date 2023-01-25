import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithTimeoutSdkErrorContextMixin } from "./TimeoutSdkErrorContextMixin";

export interface TimeoutSdkErrorContext extends WithBaseContextMixin, WithTimeoutSdkErrorContextMixin {}
