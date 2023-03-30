import { RawSchemas } from "@fern-api/yaml-schema";
import { constructRootApiFileContext, FernFileContext } from "../FernFileContext";

export interface VariableResolver {
    getDeclarationOrThrow(
        referenceToVariable: string,
        file: FernFileContext
    ): { declaration: RawSchemas.VariableDeclarationSchema; file: FernFileContext };
    getDeclaration(
        referenceToVariable: string,
        file: FernFileContext
    ): { declaration: RawSchemas.VariableDeclarationSchema; file: FernFileContext } | undefined;
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
                rootApiFile: file.rootApiFile,
            }),
        };
    }
}
