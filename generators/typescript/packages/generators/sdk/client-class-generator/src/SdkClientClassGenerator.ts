import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { JavaScriptRuntime, NpmPackage, PackageId } from "@fern-typescript/commons";
import { GeneratedSdkClientClass } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";
import { GeneratedSdkClientClassImpl } from "./GeneratedSdkClientClassImpl";

export declare namespace SdkClientClassGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
        neverThrowErrors: boolean;
        includeCredentialsOnCrossOriginRequests: boolean;
        allowCustomFetcher: boolean;
        requireDefaultEnvironment: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        npmPackage: NpmPackage | undefined;
        targetRuntime: JavaScriptRuntime;
        includeContentHeadersOnFileDownloadResponse: boolean;
        includeSerdeLayer: boolean;
    }

    export namespace generateService {
        export interface Args {
            packageId: PackageId;
            serviceClassName: string;
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
    private requireDefaultEnvironment: boolean;
    private defaultTimeoutInSeconds: number | "infinity" | undefined;
    private npmPackage: NpmPackage | undefined;
    private targetRuntime: JavaScriptRuntime;
    private includeContentHeadersOnFileDownloadResponse: boolean;
    private includeSerdeLayer: boolean;

    constructor({
        intermediateRepresentation,
        errorResolver,
        packageResolver,
        neverThrowErrors,
        includeCredentialsOnCrossOriginRequests,
        allowCustomFetcher,
        requireDefaultEnvironment,
        defaultTimeoutInSeconds,
        npmPackage,
        targetRuntime,
        includeContentHeadersOnFileDownloadResponse,
        includeSerdeLayer,
    }: SdkClientClassGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.packageResolver = packageResolver;
        this.neverThrowErrors = neverThrowErrors;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.allowCustomFetcher = allowCustomFetcher;
        this.requireDefaultEnvironment = requireDefaultEnvironment;
        this.defaultTimeoutInSeconds = defaultTimeoutInSeconds;
        this.npmPackage = npmPackage;
        this.targetRuntime = targetRuntime;
        this.includeContentHeadersOnFileDownloadResponse = includeContentHeadersOnFileDownloadResponse;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public generateService({
        packageId,
        serviceClassName,
    }: SdkClientClassGenerator.generateService.Args): GeneratedSdkClientClass {
        return new GeneratedSdkClientClassImpl({
            intermediateRepresentation: this.intermediateRepresentation,
            packageId,
            packageResolver: this.packageResolver,
            serviceClassName,
            errorResolver: this.errorResolver,
            neverThrowErrors: this.neverThrowErrors,
            includeCredentialsOnCrossOriginRequests: this.includeCredentialsOnCrossOriginRequests,
            allowCustomFetcher: this.allowCustomFetcher,
            requireDefaultEnvironment: this.requireDefaultEnvironment,
            defaultTimeoutInSeconds: this.defaultTimeoutInSeconds,
            npmPackage: this.npmPackage,
            targetRuntime: this.targetRuntime,
            includeContentHeadersOnFileDownloadResponse: this.includeContentHeadersOnFileDownloadResponse,
            includeSerdeLayer: this.includeSerdeLayer,
        });
    }
}
