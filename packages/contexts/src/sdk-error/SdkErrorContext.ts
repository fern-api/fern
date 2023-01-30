import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithGenericAPISdkErrorContextMixin } from "../generic-api-sdk-error";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithSdkErrorContextMixin } from "./SdkErrorContextMixin";

export interface SdkErrorContext
    extends WithBaseContextMixin,
        WithSdkErrorContextMixin,
        WithTypeContextMixin,
        WithGenericAPISdkErrorContextMixin {}
