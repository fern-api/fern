import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithSdkErrorContextMixin } from "./SdkErrorContextMixin";

export interface SdkErrorContext extends WithBaseContextMixin, WithSdkErrorContextMixin, WithTypeContextMixin {}
