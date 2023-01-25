import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithSdkErrorContextMixin } from "../sdk-error/SdkErrorContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithEndpointErrorUnionContextMixin } from "./EndpointErrorUnionContextMixin";

export interface EndpointErrorUnionContext
    extends WithBaseContextMixin,
        WithEndpointErrorUnionContextMixin,
        WithTypeContextMixin,
        WithSdkErrorContextMixin {}
