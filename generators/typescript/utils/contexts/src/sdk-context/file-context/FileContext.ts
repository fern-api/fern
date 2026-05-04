import { FernIr } from "@fern-fern/ir-sdk";
import { CoreUtilities, ExternalDependencies, ImportsManager } from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";
import { JsonContext } from "../../base-context/json/index.js";
import { TypeContext, TypeSchemaContext } from "../../model-context/index.js";
import { AuthProviderContext } from "../auth-provider/index.js";
import { EndpointErrorUnionContext } from "../endpoint-error-union/index.js";
import { EnvironmentsContext } from "../environments/index.js";
import { GenericAPISdkErrorContext } from "../generic-api-sdk-error/index.js";
import { NonStatusCodeErrorHandlerContext } from "../non-status-code-error-handler/index.js";
import { RequestWrapperContext } from "../request-wrapper/index.js";
import { SdkContext } from "../SdkContext.js";
import { SdkClientClassContext } from "../sdk-client-class/index.js";
import { SdkEndpointTypeSchemasContext } from "../sdk-endpoint-type-schemas/index.js";
import { SdkErrorContext } from "../sdk-error/index.js";
import { SdkErrorSchemaContext } from "../sdk-error-schema/index.js";
import { SdkInlinedRequestBodySchemaContext } from "../sdk-inlined-request-body-schema/index.js";
import { TimeoutSdkErrorContext } from "../timeout-sdk-error/index.js";
import { VersionContext } from "../version/index.js";
import { WebsocketClassContext } from "../websocket-class/index.js";
import { WebsocketTypeSchemaContext } from "../websocket-type-schema/index.js";

/**
 * FileContext extends SdkContext with per-source-file state.
 * Created once per source file during generation.
 */
export interface FileContext extends SdkContext {
    sourceFile: SourceFile;
    importsManager: ImportsManager;
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    sdkInstanceReferenceForSnippet: ts.Identifier;
    fernConstants: FernIr.Constants;
    // Sub-contexts that require per-file state (sourceFile, importsManager, coreUtilities)
    authProvider: AuthProviderContext;
    endpointErrorUnion: EndpointErrorUnionContext;
    environments: EnvironmentsContext;
    genericAPISdkError: GenericAPISdkErrorContext;
    sdkEndpointTypeSchemas: SdkEndpointTypeSchemasContext;
    sdkError: SdkErrorContext;
    sdkErrorSchema: SdkErrorSchemaContext;
    sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContext;
    timeoutSdkError: TimeoutSdkErrorContext;
    nonStatusCodeErrorHandler: NonStatusCodeErrorHandlerContext;
    requestWrapper: RequestWrapperContext;
    sdkClientClass: SdkClientClassContext;
    websocket: WebsocketClassContext;
    websocketTypeSchema: WebsocketTypeSchemaContext;
    versionContext: VersionContext;
    jsonContext: JsonContext;
    type: TypeContext;
    typeSchema: TypeSchemaContext;
}
