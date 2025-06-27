import { ImportsManager, JavaScriptRuntime, NpmPackage, PackageId } from "@fern-typescript/commons";
import { ExportsManager } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { GeneratedSdkClientClassImpl } from "./GeneratedSdkClientClassImpl";
import { OAuthTokenProviderGenerator } from "./oauth-generator/OAuthTokenProviderGenerator";

export declare namespace SdkClientClassGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
        neverThrowErrors: boolean;
        includeCredentialsOnCrossOriginRequests: boolean;
        allowCustomFetcher: boolean;
        shouldGenerateWebsocketClients: boolean;
        requireDefaultEnvironment: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        npmPackage: NpmPackage | undefined;
        targetRuntime: JavaScriptRuntime;
        includeContentHeadersOnFileDownloadResponse: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        inlineFileProperties: boolean;
        omitUndefined: boolean;
        allowExtraFields: boolean;
        oauthTokenProviderGenerator: OAuthTokenProviderGenerator;
        streamType: "wrapper" | "web";
        fileResponseType: "stream" | "binary-response";
        exportsManager: ExportsManager;
    }

    export namespace generateService {
        export interface Args {
            isRoot: boolean;
            packageId: PackageId;
            serviceClassName: string;
            importsManager: ImportsManager;
        }
    }
}

export class SdkClientClassGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;
    private packageResolver: PackageResolver;
    private neverThrowErrors: boolean;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private allowCustomFetcher: boolean;
    private shouldGenerateWebsocketClients: boolean;
    private requireDefaultEnvironment: boolean;
    private defaultTimeoutInSeconds: number | "infinity" | undefined;
    private npmPackage: NpmPackage | undefined;
    private targetRuntime: JavaScriptRuntime;
    private includeContentHeadersOnFileDownloadResponse: boolean;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    private inlineFileProperties: boolean;
    private omitUndefined: boolean;
    private allowExtraFields: boolean;
    private oauthTokenProviderGenerator: OAuthTokenProviderGenerator;
    private streamType: "wrapper" | "web";
    private readonly fileResponseType: "stream" | "binary-response";
    private exportsManager: ExportsManager;

    constructor({
        intermediateRepresentation,
        errorResolver,
        packageResolver,
        neverThrowErrors,
        includeCredentialsOnCrossOriginRequests,
        allowCustomFetcher,
        shouldGenerateWebsocketClients,
        requireDefaultEnvironment,
        defaultTimeoutInSeconds,
        npmPackage,
        targetRuntime,
        includeContentHeadersOnFileDownloadResponse,
        includeSerdeLayer,
        retainOriginalCasing,
        inlineFileProperties,
        oauthTokenProviderGenerator,
        omitUndefined,
        allowExtraFields,
        streamType,
        fileResponseType,
        exportsManager
    }: SdkClientClassGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.packageResolver = packageResolver;
        this.neverThrowErrors = neverThrowErrors;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.allowCustomFetcher = allowCustomFetcher;
        this.shouldGenerateWebsocketClients = shouldGenerateWebsocketClients;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
        this.defaultTimeoutInSeconds = defaultTimeoutInSeconds;
        this.npmPackage = npmPackage;
        this.targetRuntime = targetRuntime;
        this.includeContentHeadersOnFileDownloadResponse = includeContentHeadersOnFileDownloadResponse;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.inlineFileProperties = inlineFileProperties;
        this.oauthTokenProviderGenerator = oauthTokenProviderGenerator;
        this.omitUndefined = omitUndefined;
        this.allowExtraFields = allowExtraFields;
        this.streamType = streamType;
        this.fileResponseType = fileResponseType;
        this.exportsManager = exportsManager;
    }

    public generateService({
        isRoot,
        packageId,
        serviceClassName,
        importsManager
    }: SdkClientClassGenerator.generateService.Args): GeneratedSdkClientClass {
        return new GeneratedSdkClientClassImpl({
            isRoot,
            importsManager,
            exportsManager: this.exportsManager,
            intermediateRepresentation: this.intermediateRepresentation,
            packageId,
            packageResolver: this.packageResolver,
            serviceClassName,
            errorResolver: this.errorResolver,
            neverThrowErrors: this.neverThrowErrors,
            includeCredentialsOnCrossOriginRequests: this.includeCredentialsOnCrossOriginRequests,
            allowCustomFetcher: this.allowCustomFetcher,
            shouldGenerateWebsocketClients: this.shouldGenerateWebsocketClients,
            requireDefaultEnvironment: this.requireDefaultEnvironment,
            defaultTimeoutInSeconds: this.defaultTimeoutInSeconds,
            npmPackage: this.npmPackage,
            targetRuntime: this.targetRuntime,
            includeContentHeadersOnFileDownloadResponse: this.includeContentHeadersOnFileDownloadResponse,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            inlineFileProperties: this.inlineFileProperties,
            oauthTokenProviderGenerator: this.oauthTokenProviderGenerator,
            omitUndefined: this.omitUndefined,
            allowExtraFields: this.allowExtraFields,
            streamType: this.streamType,
            fileResponseType: this.fileResponseType
        });
    }
}
