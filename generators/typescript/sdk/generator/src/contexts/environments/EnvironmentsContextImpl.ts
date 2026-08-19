import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons";
import { EnvironmentsContext, GeneratedEnvironments } from "@fern-typescript/contexts";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { SourceFile } from "ts-morph";

import { EnvironmentsDeclarationReferencer } from "../../declaration-referencers/EnvironmentsDeclarationReferencer.js";

export declare namespace EnvironmentsContextImpl {
    export interface Init {
        intermediateRepresentation: FernIr.IntermediateRepresentation;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
        caseConverter: CaseConverter;
    }
}

export class EnvironmentsContextImpl implements EnvironmentsContext {
    private intermediateRepresentation: FernIr.IntermediateRepresentation;
    private environmentsGenerator: EnvironmentsGenerator;
    private environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private sourceFile: SourceFile;
    private readonly case: CaseConverter;

    constructor({
        intermediateRepresentation,
        environmentsGenerator,
        environmentsDeclarationReferencer,
        importsManager,
        exportsManager,
        sourceFile,
        caseConverter
    }: EnvironmentsContextImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.environmentsGenerator = environmentsGenerator;
        this.environmentsDeclarationReferencer = environmentsDeclarationReferencer;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.sourceFile = sourceFile;
        this.case = caseConverter;
    }

    public getGeneratedEnvironments(): GeneratedEnvironments {
        return this.environmentsGenerator.generateEnvironments({
            environmentEnumName: this.environmentsDeclarationReferencer.getExportedNameOfEnvironmentsEnum(),
            environmentUrlsTypeName: this.environmentsDeclarationReferencer.getExportedNameOfEnvironmentUrls(),
            environmentsConfig: this.intermediateRepresentation.environments ?? undefined,
            caseConverter: this.case
        });
    }

    public getReferenceToEnvironmentsEnum(): Reference {
        return this.environmentsDeclarationReferencer.getReferenceToEnvironmentsEnum({
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            sourceFile: this.sourceFile
        });
    }

    public getReferenceToFirstEnvironmentEnum(): Reference | undefined {
        return this.environmentsDeclarationReferencer.getReferenceToFirstEnvironmentEnum({
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            sourceFile: this.sourceFile
        });
    }

    public getReferenceToEnvironmentUrls(): Reference {
        return this.environmentsDeclarationReferencer.getReferenceToEnvironmentUrls({
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            sourceFile: this.sourceFile
        });
    }
}
