import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { EnvironmentsContextMixin, GeneratedEnvironments, Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";
import { EnvironmentEnumDeclarationReferencer } from "../../declaration-referencers/EnvironmentEnumDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace EnvironmentsContextMixinImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsEnumDeclarationReferencer: EnvironmentEnumDeclarationReferencer;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class EnvironmentsContextMixinImpl implements EnvironmentsContextMixin {
    private intermediateRepresentation: IntermediateRepresentation;
    private environmentsGenerator: EnvironmentsGenerator;
    private environmentsEnumDeclarationReferencer: EnvironmentEnumDeclarationReferencer;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        intermediateRepresentation,
        environmentsGenerator,
        environmentsEnumDeclarationReferencer,
        importsManager,
        sourceFile,
    }: EnvironmentsContextMixinImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.environmentsGenerator = environmentsGenerator;
        this.environmentsEnumDeclarationReferencer = environmentsEnumDeclarationReferencer;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
    }

    public getGeneratedEnvironments(): GeneratedEnvironments {
        return this.environmentsGenerator.generateEnvironments({
            environmentEnumName: this.environmentsEnumDeclarationReferencer.getExportedName(),
            environments: this.intermediateRepresentation.environments,
            defaultEnvironment: this.intermediateRepresentation.defaultEnvironment ?? undefined,
        });
    }

    public getReferenceToEnvironmentsEnum(): Reference {
        return this.environmentsEnumDeclarationReferencer.getReferenceToEnvironmentEnum({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
