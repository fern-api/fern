import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { EnvironmentsContextMixin, GeneratedEnvironments, Reference } from "@fern-typescript/contexts";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { SourceFile, ts } from "ts-morph";
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

    public getGeneratedEnvironments(): GeneratedEnvironments | undefined {
        if (this.intermediateRepresentation.environments.length === 0) {
            return undefined;
        }
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

    public getReferenceToDefaultEnvironment(): ts.Expression | undefined {
        const defaultEnvironmentName = this.getGeneratedEnvironments()?.defaultEnvironmentEnumMemberName;
        if (defaultEnvironmentName == null) {
            return undefined;
        }
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToEnvironmentsEnum().getExpression(),
            defaultEnvironmentName
        );
    }
}
