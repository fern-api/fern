import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithGenericAPISdkErrorContextMixin } from "../generic-api-sdk-error";
import { WithSdkErrorContextMixin } from "../sdk-error/SdkErrorContextMixin";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithSdkErrorSchemaContextMixin } from "./SdkErrorSchemaContextMixin";

export interface SdkErrorSchemaContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithSdkErrorContextMixin,
        WithSdkErrorSchemaContextMixin,
        WithGenericAPISdkErrorContextMixin {}
