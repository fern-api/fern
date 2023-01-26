import { WithBaseContextMixin } from "../base/BaseContextMixin";
import { WithEndpointErrorUnionContextMixin } from "../endpoint-error-union/EndpointErrorUnionContextMixin";
import { WithEnvironmentsContextMixin } from "../environments/EnvironmentsContextMixin";
import { WithGenericAPISdkErrorContextMixin } from "../generic-api-sdk-error/GenericAPISdkErrorContextMixin";
import { WithRequestWrapperContextMixin } from "../request-wrapper/RequestWrapperContextMixin";
import { WithSdkEndpointTypeSchemasContextMixin } from "../sdk-endpoint-type-schemas/SdkEndpointTypeSchemasContextMixin";
import { WithSdkErrorSchemaContextMixin } from "../sdk-error-schema/SdkErrorSchemaContextMixin";
import { WithSdkErrorContextMixin } from "../sdk-error/SdkErrorContextMixin";
import { WithSdkInlinedRequestBodySchemaContextMixin } from "../sdk-inlined-request-body-schema/SdkInlinedRequestBodySchemaContextMixin";
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
        WithSdkEndpointTypeSchemasContextMixin,
        WithEnvironmentsContextMixin,
        WithGenericAPISdkErrorContextMixin,
        WithTimeoutSdkErrorContextMixin,
        WithSdkInlinedRequestBodySchemaContextMixin {}
