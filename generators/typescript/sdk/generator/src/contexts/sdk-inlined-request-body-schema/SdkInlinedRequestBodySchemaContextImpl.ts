import { getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExportsManager, ImportsManager, PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedSdkInlinedRequestBodySchema, SdkInlinedRequestBodySchemaContext } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SdkInlinedRequestBodySchemaGenerator } from "@fern-typescript/sdk-inlined-request-schema-generator";
import { SourceFile } from "ts-morph";

import { SdkInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/SdkInlinedRequestBodyDeclarationReferencer.js";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy.js";

export declare namespace SdkInlinedRequestBodySchemaContextImpl {
    export interface Init {
        sdkInlinedRequestBodySchemaGenerator: SdkInlinedRequestBodySchemaGenerator;
        sdkInlinedRequestBodySchemaDeclarationReferencer: SdkInlinedRequestBodyDeclarationReferencer;
        packageResolver: PackageResolver;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
    }
}

export class SdkInlinedRequestBodySchemaContextImpl implements SdkInlinedRequestBodySchemaContext {
    private sdkInlinedRequestBodySchemaGenerator: SdkInlinedRequestBodySchemaGenerator;
    private sdkInlinedRequestBodySchemaDeclarationReferencer: SdkInlinedRequestBodyDeclarationReferencer;
    private packageResolver: PackageResolver;
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;

    constructor({
        importsManager,
        exportsManager,
        packageResolver,
        sourceFile,
        sdkInlinedRequestBodySchemaDeclarationReferencer,
        sdkInlinedRequestBodySchemaGenerator
    }: SdkInlinedRequestBodySchemaContextImpl.Init) {
        this.sdkInlinedRequestBodySchemaGenerator = sdkInlinedRequestBodySchemaGenerator;
        this.sdkInlinedRequestBodySchemaDeclarationReferencer = sdkInlinedRequestBodySchemaDeclarationReferencer;
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.packageResolver = packageResolver;
    }

    public getGeneratedInlinedRequestBodySchema(
        packageId: PackageId,
        endpointName: FernIr.NameOrString
    ): GeneratedSdkInlinedRequestBodySchema {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => getOriginalName(endpoint.name) === getOriginalName(endpointName)
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${getOriginalName(endpointName)} does not exist`);
        }
        return this.sdkInlinedRequestBodySchemaGenerator.generateInlinedRequestBodySchema({
            packageId,
            endpoint,
            typeName: this.sdkInlinedRequestBodySchemaDeclarationReferencer.getExportedName({
                packageId,
                endpoint
            })
        });
    }

    public getReferenceToInlinedRequestBody(packageId: PackageId, endpointName: FernIr.NameOrString): Reference {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => getOriginalName(endpoint.name) === getOriginalName(endpointName)
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${getOriginalName(endpointName)} does not exist`);
        }
        return this.sdkInlinedRequestBodySchemaDeclarationReferencer.getReferenceToInlinedRequestBody({
            name: { packageId, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false })
        });
    }
}
