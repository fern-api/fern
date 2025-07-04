/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernIr from "../../../index";

/**
 * Complete representation of the API schema
 */
export interface IntermediateRepresentation {
    /** The unique identifier for the API definition used within FDR. This is retrieved once a definition has been registered. */
    fdrApiDefinitionId: string | undefined;
    apiVersion: FernIr.ApiVersionScheme | undefined;
    /** This is the human readable unique id for the API. */
    apiName: FernIr.Name;
    apiDisplayName: string | undefined;
    apiDocs: string | undefined;
    auth: FernIr.ApiAuth;
    /** API Wide headers that are sent on every request */
    headers: FernIr.HttpHeader[];
    /** Headers that are sent for idempotent endpoints */
    idempotencyHeaders: FernIr.HttpHeader[];
    /** The types described by this API */
    types: Record<FernIr.TypeId, FernIr.TypeDeclaration>;
    /** The services exposed by this API */
    services: Record<FernIr.ServiceId, FernIr.HttpService>;
    /** The webhooks sent by this API */
    webhookGroups: Record<FernIr.WebhookGroupId, FernIr.WebhookGroup>;
    /** The websocket channels served by this API */
    websocketChannels: Record<FernIr.WebSocketChannelId, FernIr.WebSocketChannel> | undefined;
    errors: Record<FernIr.ErrorId, FernIr.ErrorDeclaration>;
    subpackages: Record<FernIr.SubpackageId, FernIr.Subpackage>;
    rootPackage: FernIr.Package;
    constants: FernIr.Constants;
    environments: FernIr.EnvironmentsConfig | undefined;
    basePath: FernIr.HttpPath | undefined;
    pathParameters: FernIr.PathParameter[];
    errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
    sdkConfig: FernIr.SdkConfig;
    variables: FernIr.VariableDeclaration[];
    serviceTypeReferenceInfo: FernIr.ServiceTypeReferenceInfo;
    readmeConfig: FernIr.ReadmeConfig | undefined;
    sourceConfig: FernIr.SourceConfig | undefined;
    publishConfig: FernIr.PublishingConfig | undefined;
    dynamic: FernIr.dynamic.DynamicIntermediateRepresentation | undefined;
    selfHosted: boolean | undefined;
    audiences: FernIr.AudienceDefinition[] | undefined;
}
