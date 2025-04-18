import { RawSchemas } from "@fern-api/fern-definition-schema";
import { VariableId } from "@fern-api/ir-sdk";

import { FernFileContext, constructRootApiFileContext } from "../FernFileContext";

export interface VariableResolver {
    getDeclarationOrThrow(
        referenceToVariable: string,
        file: FernFileContext
    ): { declaration: RawSchemas.VariableDeclarationSchema; file: FernFileContext };
    getDeclaration(
        referenceToVariable: string,
        file: FernFileContext
    ): { declaration: RawSchemas.VariableDeclarationSchema; file: FernFileContext } | undefined;
    getVariableIdOrThrow(referenceToVariable: string): VariableId;
    getVariableId(referenceToVariable: string): VariableId | undefined;
}

export class VariableResolverImpl implements VariableResolver {
    public static VARIABLE_PREFIX = "$";

    public getDeclarationOrThrow(
        referenceToVariable: string,
        file: FernFileContext
    ): { declaration: RawSchemas.VariableDeclarationSchema; file: FernFileContext } {
        const declaration = this.getDeclaration(referenceToVariable, file);
        if (declaration == null) {
            throw new Error("Variable does not exist: " + referenceToVariable);
        }
        return declaration;
    }

    public getDeclaration(
        referenceToVariable: string,
        file: FernFileContext
    ): { declaration: RawSchemas.VariableDeclarationSchema; file: FernFileContext } | undefined {
        if (!referenceToVariable.startsWith(VariableResolverImpl.VARIABLE_PREFIX)) {
            return undefined;
        }

        const declaration = file.rootApiFile.variables?.[referenceToVariable.substring(1)];
        if (declaration == null) {
            return undefined;
        }

        return {
            declaration,
            file: constructRootApiFileContext({
                casingsGenerator: file.casingsGenerator,
                rootApiFile: file.rootApiFile
            })
        };
    }

    public getVariableIdOrThrow(referenceToVariable: string): VariableId {
        const variableId = this.getVariableId(referenceToVariable);
        if (variableId == null) {
            throw new Error("Variable reference does not start with " + VariableResolverImpl.VARIABLE_PREFIX);
        }
        return variableId;
    }

    public getVariableId(referenceToVariable: string): VariableId | undefined {
        if (!referenceToVariable.startsWith(VariableResolverImpl.VARIABLE_PREFIX)) {
            return undefined;
        }
        return referenceToVariable.substring(VariableResolverImpl.VARIABLE_PREFIX.length);
    }
}
