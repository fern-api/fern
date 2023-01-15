import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { EnvironmentsContextMixin, GeneratedEnvironments, Reference } from "@fern-typescript/contexts";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { SourceFile } from "ts-morph";
import { EnvironmentsDeclarationReferencer } from "../../declaration-referencers/EnvironmentsDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace EnvironmentsContextMixinImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class EnvironmentsContextMixinImpl implements EnvironmentsContextMixin {
    private intermediateRepresentation: IntermediateRepresentation;
    private environmentsGenerator: EnvironmentsGenerator;
    private environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        intermediateRepresentation,
        environmentsGenerator,
        environmentsDeclarationReferencer,
        importsManager,
        sourceFile,
    }: EnvironmentsContextMixinImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.environmentsGenerator = environmentsGenerator;
        this.environmentsDeclarationReferencer = environmentsDeclarationReferencer;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
    }

    public getGeneratedEnvironments(): GeneratedEnvironments {
        return this.environmentsGenerator.generateEnvironments({
            environmentEnumName: this.environmentsDeclarationReferencer.getExportedNameOfEnvironmentsEnum(),
            environmentUrlsTypeName: this.environmentsDeclarationReferencer.getExportedNameOfEnvironmentUrls(),
            environmentsConfig: this.intermediateRepresentation.environments ?? undefined,
        });
    }

    public getReferenceToEnvironmentsEnum(): Reference {
        return this.environmentsDeclarationReferencer.getReferenceToEnvironmentsEnum({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }

    public getReferenceToEnvironmentUrls(): Reference {
        return this.environmentsDeclarationReferencer.getReferenceToEnvironmentUrls({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
