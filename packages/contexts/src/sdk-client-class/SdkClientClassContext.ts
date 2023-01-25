import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithEndpointErrorUnionContextMixin } from "../endpoint-error-union/EndpointErrorUnionContextMixin";
import { WithEndpointTypeSchemasContextMixin } from "../endpoint-type-schemas/EndpointTypeSchemasContextMixin";
import { WithEnvironmentsContextMixin } from "../environments/EnvironmentsContextMixin";
import { WithGenericAPISdkErrorContextMixin } from "../generic-api-sdk-error/GenericAPISdkErrorContextMixin";
import { WithInlinedRequestBodySchemaContextMixin } from "../inlined-request-body-schema/InlinedRequestBodySchemaContextMixin";
import { WithRequestWrapperContextMixin } from "../request-wrapper/RequestWrapperContextMixin";
import { WithSdkErrorSchemaContextMixin } from "../sdk-error-schema/SdkErrorSchemaContextMixin";
import { WithSdkErrorContextMixin } from "../sdk-error/SdkErrorContextMixin";
import { WithTimeoutSdkErrorContextMixin } from "../timeout-sdk-error/TimeoutSdkErrorContextMixin";
import { WithTypeSchemaContextMixin } from "../type-schema/TypeSchemaContextMixin";
import { WithTypeContextMixin } from "../type/TypeContextMixin";
import { WithSdkClientClassContextMixin } from "./SdkClientClassContextMixin";

export interface SdkClientClassContext
    extends WithBaseContextMixin,
        WithTypeContextMixin,
        WithTypeSchemaContextMixin,
        WithSdkErrorContextMixin,
        WithSdkErrorSchemaContextMixin,
        WithSdkClientClassContextMixin,
        WithEndpointErrorUnionContextMixin,
        WithRequestWrapperContextMixin,
        WithEndpointTypeSchemasContextMixin,
        WithEnvironmentsContextMixin,
        WithGenericAPISdkErrorContextMixin,
        WithTimeoutSdkErrorContextMixin,
        WithInlinedRequestBodySchemaContextMixin {}
