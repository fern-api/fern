import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithEndpointErrorUnionContextMixin } from "../endpoint-error-union/EndpointErrorUnionContextMixin";
import { WithRequestWrapperContextMixin } from "../request-wrapper/RequestWrapperContextMixin";
import { WithSdkErrorContextMixin } from "../sdk-error/SdkErrorContextMixin";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithSdkEndpointTypeSchemasContextMixin } from "./SdkEndpointTypeSchemasContextMixin";

export interface SdkEndpointTypeSchemasContext
    extends WithBaseContextMixin,
        WithEndpointErrorUnionContextMixin,
        WithRequestWrapperContextMixin,
        WithSdkEndpointTypeSchemasContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithSdkErrorContextMixin {}
