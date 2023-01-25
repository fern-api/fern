import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithEndpointErrorUnionContextMixin } from "../endpoint-error-union/EndpointErrorUnionContextMixin";
import { WithRequestWrapperContextMixin } from "../request-wrapper/RequestWrapperContextMixin";
import { WithSdkErrorSchemaContextMixin } from "../sdk-error-schema/SdkErrorSchemaContextMixin";
import { WithSdkErrorContextMixin } from "../sdk-error/SdkErrorContextMixin";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithEndpointTypeSchemasContextMixin } from "./EndpointTypeSchemasContextMixin";

export interface EndpointTypeSchemasContext
    extends WithBaseContextMixin,
        WithEndpointErrorUnionContextMixin,
        WithRequestWrapperContextMixin,
        WithEndpointTypeSchemasContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithSdkErrorContextMixin,
        WithSdkErrorSchemaContextMixin {}
