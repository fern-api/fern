import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { EnvironmentsContext } from "@fern-typescript/contexts";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { EnvironmentsDeclarationReferencer } from "../../declaration-referencers/EnvironmentsDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { EnvironmentsContextMixinImpl } from "./EnvironmentsContextMixinImpl";

export declare namespace EnvironmentsContextImpl {
    export interface Init extends BaseContextImpl.Init {
        intermediateRepresentation: IntermediateRepresentation;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
        treatUnknownAsAny: boolean;
    }
}

export class EnvironmentsContextImpl extends BaseContextImpl implements EnvironmentsContext {
    public readonly environments: EnvironmentsContextMixinImpl;

    constructor({
        intermediateRepresentation,
        environmentsGenerator,
        environmentsDeclarationReferencer,
        ...superInit
    }: EnvironmentsContextImpl.Init) {
        super(superInit);
        this.environments = new EnvironmentsContextMixinImpl({
            intermediateRepresentation,
            environmentsGenerator,
            environmentsDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
