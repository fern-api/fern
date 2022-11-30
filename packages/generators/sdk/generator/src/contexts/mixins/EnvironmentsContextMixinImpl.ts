import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { EnvironmentsContextMixin, GeneratedEnvironments } from "@fern-typescript/sdk-declaration-handler";
import { EnvironmentEnumDeclarationReferencer } from "../../declaration-referencers/EnvironmentEnumDeclarationReferencer";

export declare namespace EnvironmentsContextMixinImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsEnumDeclarationReferencer: EnvironmentEnumDeclarationReferencer;
    }
}

export class EnvironmentsContextMixinImpl implements EnvironmentsContextMixin {
    private intermediateRepresentation: IntermediateRepresentation;
    private environmentsGenerator: EnvironmentsGenerator;
    private environmentsEnumDeclarationReferencer: EnvironmentEnumDeclarationReferencer;

    constructor({
        intermediateRepresentation,
        environmentsGenerator,
        environmentsEnumDeclarationReferencer,
    }: EnvironmentsContextMixinImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.environmentsGenerator = environmentsGenerator;
        this.environmentsEnumDeclarationReferencer = environmentsEnumDeclarationReferencer;
    }

    public getGeneratedEnvironments(): GeneratedEnvironments {
        return this.environmentsGenerator.generateEnvironments({
            environmentEnumName: this.environmentsEnumDeclarationReferencer.getExportedName(),
            environments: this.intermediateRepresentation.environments,
        });
    }
}
