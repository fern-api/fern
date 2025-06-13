import { ImportsManager, NpmPackage, PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedSdkClientUtils, SdkClientUtilsContext } from "@fern-typescript/contexts";
import { SdkClientUtilsGenerator } from "@fern-typescript/sdk-client-utils-generator";
import { SourceFile } from "ts-morph";

import { SdkClientUtilsDeclarationReferencer } from "../../declaration-referencers/SdkClientUtilsDeclarationReferencer";

export declare namespace SdkClientUtilsContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        sdkClientUtilsDeclarationReferencer: SdkClientUtilsDeclarationReferencer;
        sdkClientUtilsGenerator: SdkClientUtilsGenerator;
    }
}

export class SdkClientUtilsContextImpl implements SdkClientUtilsContext {
    public sourceFile: SourceFile;
    public importsManager: ImportsManager;
    public sdkClientUtilsGenerator: SdkClientUtilsGenerator;
    public sdkClientUtilsDeclarationReferencer: SdkClientUtilsDeclarationReferencer;

    constructor({
        sourceFile,
        importsManager,
        sdkClientUtilsGenerator,
        sdkClientUtilsDeclarationReferencer
    }: SdkClientUtilsContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.sdkClientUtilsGenerator = sdkClientUtilsGenerator;
        this.sdkClientUtilsDeclarationReferencer = sdkClientUtilsDeclarationReferencer;
    }

    public getGeneratedUtilsFile(packageId: PackageId, filename: string): GeneratedSdkClientUtils {
        return this.sdkClientUtilsGenerator.generateUtilsFile({
            packageId,
            filename,
            importsManager: this.importsManager
        });
    }

    public getReferenceToUtils(
        packageId: PackageId,
        { importAlias, npmPackage }: { importAlias?: string; npmPackage?: NpmPackage } = {}
    ): Reference {
        if (packageId.isRoot) {
            throw new Error("Utils are only generated for subpackages, not root package");
        }

        if (npmPackage != null) {
            return this.sdkClientUtilsDeclarationReferencer.getReferenceToUtils({
                name: packageId.subpackageId,
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                importStrategy: { type: "fromPackage", packageName: npmPackage.packageName }
            });
        }
        return this.sdkClientUtilsDeclarationReferencer.getReferenceToUtils({
            name: packageId.subpackageId,
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias }
        });
    }
}
