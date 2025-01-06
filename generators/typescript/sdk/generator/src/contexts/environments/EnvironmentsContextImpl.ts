import { ImportsManager, Reference } from "@fern-typescript/commons";
import { EnvironmentsContext, GeneratedEnvironments } from "@fern-typescript/contexts";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { SourceFile } from "ts-morph";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { EnvironmentsDeclarationReferencer } from "../../declaration-referencers/EnvironmentsDeclarationReferencer";

export declare namespace EnvironmentsContextImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class EnvironmentsContextImpl implements EnvironmentsContext {
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
        sourceFile
    }: EnvironmentsContextImpl.Init) {
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
            environmentsConfig: this.intermediateRepresentation.environments ?? undefined
        });
    }

    public getReferenceToEnvironmentsEnum(): Reference {
        return this.environmentsDeclarationReferencer.getReferenceToEnvironmentsEnum({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile
        });
    }

    public getReferenceToFirstEnvironmentEnum(): Reference | undefined {
        return this.environmentsDeclarationReferencer.getReferenceToFirstEnvironmentEnum({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile
        });
    }

    public getReferenceToEnvironmentUrls(): Reference {
        return this.environmentsDeclarationReferencer.getReferenceToEnvironmentUrls({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile
        });
    }
}
