import { ImportsManager, NpmPackage, PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedSdkClientClass, SdkClientClassContext } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SdkClientClassGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SourceFile } from "ts-morph";

import { SdkClientClassDeclarationReferencer } from "../../declaration-referencers/SdkClientClassDeclarationReferencer";

export declare namespace SdkClientClassContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        sdkClientClassDeclarationReferencer: SdkClientClassDeclarationReferencer;
        sdkClientClassGenerator: SdkClientClassGenerator;
        packageResolver: PackageResolver;
    }
}

export class SdkClientClassContextImpl implements SdkClientClassContext {
    public sourceFile: SourceFile;
    public importsManager: ImportsManager;
    public sdkClientClassGenerator: SdkClientClassGenerator;
    public sdkClientClassDeclarationReferencer: SdkClientClassDeclarationReferencer;

    constructor({
        sourceFile,
        importsManager,
        sdkClientClassGenerator,
        sdkClientClassDeclarationReferencer
    }: SdkClientClassContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.sdkClientClassGenerator = sdkClientClassGenerator;
        this.sdkClientClassDeclarationReferencer = sdkClientClassDeclarationReferencer;
    }

    public getGeneratedSdkClientClass(packageId: PackageId): GeneratedSdkClientClass {
        return this.sdkClientClassGenerator.generateService({
            isRoot: packageId.isRoot,
            importsManager: this.importsManager,
            packageId,
            serviceClassName: this.sdkClientClassDeclarationReferencer.getExportedName(packageId)
        });
    }

    public getReferenceToClientClass(
        packageId: PackageId,
        { importAlias, npmPackage }: { importAlias?: string; npmPackage?: NpmPackage } = {}
    ): Reference {
        if (npmPackage != null) {
            return this.sdkClientClassDeclarationReferencer.getReferenceToClient({
                name: packageId,
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                importStrategy: { type: "fromPackage", packageName: npmPackage.packageName }
            });
        }
        return this.sdkClientClassDeclarationReferencer.getReferenceToClient({
            name: packageId,
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias }
        });
    }
}
