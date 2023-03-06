import { ImportsManager, PackageId, Reference } from "@fern-typescript/commons";
import { GeneratedSdkClientClass, SdkClientClassContextMixin } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SdkClientClassGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SourceFile } from "ts-morph";
import { SdkClientClassDeclarationReferencer } from "../../declaration-referencers/SdkClientClassDeclarationReferencer";

export declare namespace SdkClientClassContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        sdkClientClassDeclarationReferencer: SdkClientClassDeclarationReferencer;
        sdkClientClassGenerator: SdkClientClassGenerator;
        packageResolver: PackageResolver;
    }
}

export class SdkClientClassContextMixinImpl implements SdkClientClassContextMixin {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private sdkClientClassGenerator: SdkClientClassGenerator;
    private sdkClientClassDeclarationReferencer: SdkClientClassDeclarationReferencer;

    constructor({
        sourceFile,
        importsManager,
        sdkClientClassGenerator,
        sdkClientClassDeclarationReferencer,
    }: SdkClientClassContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.sdkClientClassGenerator = sdkClientClassGenerator;
        this.sdkClientClassDeclarationReferencer = sdkClientClassDeclarationReferencer;
    }

    public getGeneratedSdkClientClass(packageId: PackageId): GeneratedSdkClientClass {
        return this.sdkClientClassGenerator.generateService({
            packageId,
            serviceClassName: this.sdkClientClassDeclarationReferencer.getExportedName(packageId),
        });
    }

    public getReferenceToClientClass(packageId: PackageId, { importAlias }: { importAlias?: string } = {}): Reference {
        return this.sdkClientClassDeclarationReferencer.getReferenceToClient({
            name: packageId,
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias },
        });
    }
}
