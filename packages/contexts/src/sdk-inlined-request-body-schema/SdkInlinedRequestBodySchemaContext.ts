import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithRequestWrapperContextMixin } from "../request-wrapper";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithSdkInlinedRequestBodySchemaContextMixin } from "./SdkInlinedRequestBodySchemaContextMixin";

export interface SdkInlinedRequestBodySchemaContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithRequestWrapperContextMixin,
        WithSdkInlinedRequestBodySchemaContextMixin {}
