import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedExpressRegister } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";

import { GeneratedExpressRegisterImpl } from "./GeneratedExpressRegisterImpl.js";

export declare namespace ExpressRegisterGenerator {
    export interface Init {
        intermediateRepresentation: FernIr.IntermediateRepresentation;
        registerFunctionName: string;
        areImplementationsOptional: boolean;
        packageResolver: PackageResolver;
    }
}

export class ExpressRegisterGenerator {
    private intermediateRepresentation: FernIr.IntermediateRepresentation;
    private registerFunctionName: string;
    private areImplementationsOptional: boolean;
    private packageResolver: PackageResolver;

    constructor({
        intermediateRepresentation,
        registerFunctionName,
        areImplementationsOptional,
        packageResolver
    }: ExpressRegisterGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.registerFunctionName = registerFunctionName;
        this.areImplementationsOptional = areImplementationsOptional;
        this.packageResolver = packageResolver;
    }

    public generateRegisterFunction(): GeneratedExpressRegister | undefined {
        if (Object.keys(this.intermediateRepresentation.services).length === 0) {
            return undefined;
        }
        return new GeneratedExpressRegisterImpl({
            intermediateRepresentation: this.intermediateRepresentation,
            registerFunctionName: this.registerFunctionName,
            areImplementationsOptional: this.areImplementationsOptional,
            packageResolver: this.packageResolver
        });
    }
}
