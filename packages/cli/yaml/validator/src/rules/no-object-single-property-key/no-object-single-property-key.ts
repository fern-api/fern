import { constructFernFileContext, TypeResolverImpl } from "@fern-api/ir-generator";
import { isRawDiscriminatedUnionDefinition, isRawObjectDefinition } from "@fern-api/yaml-schema";
import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const NoObjectSinglePropertyKeyRule: Rule = {
    name: "no-object-single-property-key",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);

        return {
            definitionFile: {
                typeDeclaration: ({ declaration }, { relativeFilepath, contents }) => {
                    const violations: RuleViolation[] = [];
                    if (!isRawDiscriminatedUnionDefinition(declaration)) {
                        return violations;
                    }

                    for (const [discriminantValue, singleUnionType] of Object.entries(declaration.union)) {
                        if (typeof singleUnionType !== "string" && singleUnionType.key != null) {
                            const resolvedType =
                                typeof singleUnionType.type === "string"
                                    ? typeResolver.resolveType({
                                          type: singleUnionType.type,
                                          file: constructFernFileContext({
                                              relativeFilepath,
                                              definitionFile: contents,
                                              casingsGenerator: CASINGS_GENERATOR,
                                              rootApiFile: workspace.definition.rootApiFile.contents,
                                          }),
                                      })
                                    : undefined;
                            if (resolvedType == null) {
                                violations.push({
                                    severity: "error",
                                    message: `Union subtype ${discriminantValue} has no body, so key cannot be defined`,
                                });
                            } else if (
                                resolvedType._type === "named" &&
                                isRawObjectDefinition(resolvedType.declaration)
                            ) {
                                violations.push({
                                    severity: "error",
                                    message: `Union subtype ${discriminantValue} extends an object, so key cannot be defined`,
                                });
                            }
                        }
                    }

                    return violations;
                },
            },
        };
    },
};
