import { WithBaseContextMixin, WithTimeoutSdkErrorContextMixin } from "./mixins";

export interface TimeoutSdkErrorContext extends WithBaseContextMixin, WithTimeoutSdkErrorContextMixin {}
