import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { GeneratedExpressRegister } from "@fern-typescript/contexts";
import { GeneratedExpressRegisterImpl } from "./GeneratedExpressRegisterImpl";

export declare namespace ExpressRegisterGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        registerFunctionName: string;
    }
}

export class ExpressRegisterGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private registerFunctionName: string;

    constructor({ intermediateRepresentation, registerFunctionName }: ExpressRegisterGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.registerFunctionName = registerFunctionName;
    }

    public generateRegisterFunction(): GeneratedExpressRegister {
        return new GeneratedExpressRegisterImpl({
            intermediateRepresentation: this.intermediateRepresentation,
            registerFunctionName: this.registerFunctionName,
        });
    }
}
