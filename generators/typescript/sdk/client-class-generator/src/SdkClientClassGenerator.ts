import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ExportsManager, ImportsManager, NpmPackage, PackageId } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";

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
        includeContentHeadersOnFileDownloadResponse: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        inlineFileProperties: boolean;
        omitUndefined: boolean;
        allowExtraFields: boolean;
        oauthTokenProviderGenerator: OAuthTokenProviderGenerator;
        streamType: "wrapper" | "web";
        fileResponseType: "stream" | "binary-response";
        formDataSupport: "Node16" | "Node18";
        exportsManager: ExportsManager;
        omitFernHeaders: boolean;
        useDefaultRequestParameterValues: boolean;
        generateEndpointMetadata: boolean;
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
    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly errorResolver: ErrorResolver;
    private readonly packageResolver: PackageResolver;
    private readonly neverThrowErrors: boolean;
    private readonly includeCredentialsOnCrossOriginRequests: boolean;
    private readonly allowCustomFetcher: boolean;
    private readonly shouldGenerateWebsocketClients: boolean;
    private readonly requireDefaultEnvironment: boolean;
    private readonly defaultTimeoutInSeconds: number | "infinity" | undefined;
    private readonly npmPackage: NpmPackage | undefined;
    private readonly includeContentHeadersOnFileDownloadResponse: boolean;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly inlineFileProperties: boolean;
    private readonly omitUndefined: boolean;
    private readonly allowExtraFields: boolean;
    private readonly oauthTokenProviderGenerator: OAuthTokenProviderGenerator;
    private readonly streamType: "wrapper" | "web";
    private readonly formDataSupport: "Node16" | "Node18";
    private readonly fileResponseType: "stream" | "binary-response";
    private readonly exportsManager: ExportsManager;
    private readonly omitFernHeaders: boolean;
    private readonly useDefaultRequestParameterValues: boolean;
    private readonly generateEndpointMetadata: boolean;

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
        includeContentHeadersOnFileDownloadResponse,
        includeSerdeLayer,
        retainOriginalCasing,
        inlineFileProperties,
        oauthTokenProviderGenerator,
        omitUndefined,
        allowExtraFields,
        streamType,
        fileResponseType,
        exportsManager,
        formDataSupport,
        omitFernHeaders,
        useDefaultRequestParameterValues,
        generateEndpointMetadata
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
        this.formDataSupport = formDataSupport;
        this.omitFernHeaders = omitFernHeaders;
        this.useDefaultRequestParameterValues = useDefaultRequestParameterValues;
        this.generateEndpointMetadata = generateEndpointMetadata;
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
            includeContentHeadersOnFileDownloadResponse: this.includeContentHeadersOnFileDownloadResponse,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            inlineFileProperties: this.inlineFileProperties,
            oauthTokenProviderGenerator: this.oauthTokenProviderGenerator,
            omitUndefined: this.omitUndefined,
            allowExtraFields: this.allowExtraFields,
            streamType: this.streamType,
            fileResponseType: this.fileResponseType,
            formDataSupport: this.formDataSupport,
            omitFernHeaders: this.omitFernHeaders,
            useDefaultRequestParameterValues: this.useDefaultRequestParameterValues,
            generateEndpointMetadata: this.generateEndpointMetadata
        });
    }
}
