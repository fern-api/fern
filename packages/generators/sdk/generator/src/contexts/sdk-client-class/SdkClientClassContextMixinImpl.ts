import { FernFilepath } from "@fern-fern/ir-model/commons";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedSdkClientClass, SdkClientClassContextMixin } from "@fern-typescript/contexts";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SdkClientClassGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SourceFile } from "ts-morph";
import { SdkClientClassDeclarationReferencer } from "../../declaration-referencers/SdkClientClassDeclarationReferencer";

export declare namespace SdkClientClassContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        sdkClientClassDeclarationReferencer: SdkClientClassDeclarationReferencer;
        sdkClientClassGenerator: SdkClientClassGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class SdkClientClassContextMixinImpl implements SdkClientClassContextMixin {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private sdkClientClassGenerator: SdkClientClassGenerator;
    private sdkClientClassDeclarationReferencer: SdkClientClassDeclarationReferencer;
    private serviceResolver: ServiceResolver;

    constructor({
        sourceFile,
        importsManager,
        sdkClientClassGenerator,
        sdkClientClassDeclarationReferencer,
        serviceResolver,
    }: SdkClientClassContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.sdkClientClassGenerator = sdkClientClassGenerator;
        this.sdkClientClassDeclarationReferencer = sdkClientClassDeclarationReferencer;
        this.serviceResolver = serviceResolver;
    }

    public getGeneratedSdkClientClass(service: FernFilepath): GeneratedSdkClientClass {
        return this.sdkClientClassGenerator.generateService({
            service: this.serviceResolver.getServiceDeclarationFromName(service),
            serviceClassName: this.sdkClientClassDeclarationReferencer.getExportedName(service),
        });
    }

    public getReferenceToService(service: FernFilepath, { importAlias }: { importAlias: string }): Reference {
        return this.sdkClientClassDeclarationReferencer.getReferenceToClient({
            name: service,
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias },
        });
    }
}
