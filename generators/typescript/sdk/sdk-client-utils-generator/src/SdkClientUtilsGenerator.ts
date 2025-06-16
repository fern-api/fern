import { ImportsManager, JavaScriptRuntime, NpmPackage, PackageId } from "@fern-typescript/commons";
import { GeneratedSdkClientUtils } from "@fern-typescript/contexts";
import { ErrorResolver, PackageResolver } from "@fern-typescript/resolvers";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { GeneratedCreateWebSocketImpl } from "./GeneratedCreateWebSocketImpl";
import { GeneratedGetAuthHeadersImpl } from "./GeneratedGetAuthHeadersImpl";
import { GeneratedGetAuthProtocolsImpl } from "./GeneratedGetAuthProtocolsImpl";
import { GeneratedGetHeadersImpl } from "./GeneratedGetHeadersImpl";

export declare namespace SdkClientUtilsGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        errorResolver: ErrorResolver;
        packageResolver: PackageResolver;
        targetRuntime: JavaScriptRuntime;
        npmPackage: NpmPackage | undefined;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        allowExtraFields: boolean;
    }
}

export class SdkClientUtilsGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private errorResolver: ErrorResolver;
    private packageResolver: PackageResolver;
    private targetRuntime: JavaScriptRuntime;
    private npmPackage: NpmPackage | undefined;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    private omitUndefined: boolean;
    private allowExtraFields: boolean;

    constructor({
        intermediateRepresentation,
        errorResolver,
        packageResolver,
        targetRuntime,
        npmPackage,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined,
        allowExtraFields
    }: SdkClientUtilsGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.errorResolver = errorResolver;
        this.packageResolver = packageResolver;
        this.targetRuntime = targetRuntime;
        this.npmPackage = npmPackage;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.omitUndefined = omitUndefined;
        this.allowExtraFields = allowExtraFields;
    }

    private getCommonProps(packageId: PackageId, importsManager: ImportsManager) {
        return {
            importsManager,
            intermediateRepresentation: this.intermediateRepresentation,
            packageId,
            packageResolver: this.packageResolver,
            errorResolver: this.errorResolver,
            targetRuntime: this.targetRuntime,
            npmPackage: this.npmPackage,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            omitUndefined: this.omitUndefined,
            allowExtraFields: this.allowExtraFields
        };
    }

    public generateUtilsFile({
        packageId,
        filename,
        importsManager
    }: {
        packageId: PackageId;
        filename: string;
        importsManager: ImportsManager;
    }): GeneratedSdkClientUtils {
        const commonProps = this.getCommonProps(packageId, importsManager);

        switch (filename) {
            case "createWebSocket.ts":
                return new GeneratedCreateWebSocketImpl({
                    ...commonProps,
                    filename
                });
            case "getAuthHeaders.ts":
                return new GeneratedGetAuthHeadersImpl({
                    ...commonProps,
                    filename
                });
            case "getAuthProtocols.ts":
                return new GeneratedGetAuthProtocolsImpl({
                    ...commonProps,
                    filename
                });
            case "getHeaders.ts":
                return new GeneratedGetHeadersImpl({
                    ...commonProps,
                    filename
                });
            default:
                throw new Error(`Unknown utils filename: ${filename}`);
        }
    }
}
