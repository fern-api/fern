import { WithBaseContextMixin, WithSdkErrorContextMixin, WithTypeContextMixin } from "./mixins";

export interface SdkErrorContext extends WithBaseContextMixin, WithSdkErrorContextMixin, WithTypeContextMixin {}
