import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithSdkErrorContextMixin } from "../sdk-error/SdkErrorContextMixin";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithSdkErrorSchemaContextMixin } from "./SdkErrorSchemaContextMixin";

export interface SdkErrorSchemaContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithSdkErrorContextMixin,
        WithSdkErrorSchemaContextMixin {}
