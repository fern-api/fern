import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithEndpointErrorUnionContextMixin } from "../endpoint-error-union/EndpointErrorUnionContextMixin";
import { WithSdkErrorContextMixin } from "../sdk-error/SdkErrorContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithRequestWrapperContextMixin } from "./RequestWrapperContextMixin";

export interface RequestWrapperContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithSdkErrorContextMixin,
        WithEndpointErrorUnionContextMixin,
        WithRequestWrapperContextMixin {}
