import { JavaScriptRuntime } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { ModelContext } from "../model-context/ModelContext";
import { EndpointErrorUnionContext } from "./endpoint-error-union";
import { EnvironmentsContext } from "./environments";
import { GenericAPISdkErrorContext } from "./generic-api-sdk-error";
import { RequestWrapperContext } from "./request-wrapper";
import { SdkClientClassContext } from "./sdk-client-class";
import { SdkEndpointTypeSchemasContext } from "./sdk-endpoint-type-schemas";
import { SdkErrorContext } from "./sdk-error";
import { SdkErrorSchemaContext } from "./sdk-error-schema";
import { SdkInlinedRequestBodySchemaContext } from "./sdk-inlined-request-body-schema";
import { TimeoutSdkErrorContext } from "./timeout-sdk-error";

export interface SdkContext extends ModelContext {
    sdkInstanceReferenceForSnippet: ts.Identifier;
    namespaceExport: string | undefined;
    endpointErrorUnion: EndpointErrorUnionContext;
    environments: EnvironmentsContext;
    genericAPISdkError: GenericAPISdkErrorContext;
    sdkEndpointTypeSchemas: SdkEndpointTypeSchemasContext;
    sdkError: SdkErrorContext;
    sdkErrorSchema: SdkErrorSchemaContext;
    sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContext;
    timeoutSdkError: TimeoutSdkErrorContext;
    requestWrapper: RequestWrapperContext;
    sdkClientClass: SdkClientClassContext;
    targetRuntime: JavaScriptRuntime;
}
