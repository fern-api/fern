import { WithBaseContextMixin, WithTimeoutErrorContextMixin } from "./mixins";

export interface TimeoutErrorContext extends WithBaseContextMixin, WithTimeoutErrorContextMixin {}
