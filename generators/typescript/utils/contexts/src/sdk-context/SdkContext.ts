import { JavaScriptRuntime, NpmPackage } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { BaseContext } from "../base-context";
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
import { VersionContext } from "./version";

export interface SdkContext extends BaseContext {
    logger: Logger;
    version: string | undefined;
    ir: IntermediateRepresentation;
    config: FernGeneratorExec.GeneratorConfig;
    generatorNotificationService: GeneratorNotificationService;
    npmPackage: NpmPackage | undefined;
    sdkInstanceReferenceForSnippet: ts.Identifier;
    namespaceExport: string;
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
    versionContext: VersionContext;
    targetRuntime: JavaScriptRuntime;
    includeSerdeLayer: boolean;
    retainOriginalCasing: boolean;
    generateOAuthClients: boolean;
    inlineFileProperties: boolean;
    omitUndefined: boolean;
    neverThrowErrors: boolean;
}
