import {
    FernFileContext,
    VariableResolverImpl,
    constructFernFileContext,
    constructRootApiFileContext
} from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const NoUndefinedVariableReferenceRule: Rule = {
    name: "no-undefined-variable-reference",
    create: ({ workspace }) => {
        const variableResolver = new VariableResolverImpl();

        const validateVariableReference = (variableReference: string, file: FernFileContext): RuleViolation[] => {
            if (!variableReference.startsWith(VariableResolverImpl.VARIABLE_PREFIX)) {
                return [
                    {
                        severity: "error",
                        message: `Variable reference must start with ${VariableResolverImpl.VARIABLE_PREFIX}`
                    }
                ];
            }

            if (variableResolver.getDeclaration(variableReference, file)) {
                return [];
            }

            return [
                {
                    severity: "error",
                    message: `Variable ${variableReference} is not defined.`
                }
            ];
        };

        return {
            rootApiFile: {
                variableReference: (variableReference) => {
                    return validateVariableReference(
                        variableReference,
                        constructRootApiFileContext({
                            casingsGenerator: CASINGS_GENERATOR,
                            rootApiFile: workspace.definition.rootApiFile.contents
                        })
                    );
                }
            },
            definitionFile: {
                variableReference: (variableReference, { relativeFilepath, contents }) => {
                    return validateVariableReference(
                        variableReference,
                        constructFernFileContext({
                            casingsGenerator: CASINGS_GENERATOR,
                            relativeFilepath,
                            definitionFile: contents,
                            rootApiFile: workspace.definition.rootApiFile.contents
                        })
                    );
                }
            }
        };
    }
};
