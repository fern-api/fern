import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { GeneratedExpressRegister } from "@fern-typescript/contexts";
import { GeneratedExpressRegisterImpl } from "./GeneratedExpressRegisterImpl";

export declare namespace ExpressRegisterGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        registerFunctionName: string;
        areImplementationsOptional: boolean;
    }
}

export class ExpressRegisterGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private registerFunctionName: string;
    private areImplementationsOptional: boolean;

    constructor({
        intermediateRepresentation,
        registerFunctionName,
        areImplementationsOptional,
    }: ExpressRegisterGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.registerFunctionName = registerFunctionName;
        this.areImplementationsOptional = areImplementationsOptional;
    }

    public generateRegisterFunction(): GeneratedExpressRegister | undefined {
        if (Object.keys(this.intermediateRepresentation.services).length === 0) {
            return undefined;
        }
        return new GeneratedExpressRegisterImpl({
            intermediateRepresentation: this.intermediateRepresentation,
            registerFunctionName: this.registerFunctionName,
            areImplementationsOptional: this.areImplementationsOptional,
        });
    }
}
