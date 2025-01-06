import { RawSchemas, isRawDiscriminatedUnionDefinition } from "@fern-api/fern-definition-schema";
import { TypeResolverImpl, constructFernFileContext } from "@fern-api/ir-generator";

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

                    const getViolationsForVariant = ({
                        discriminantValue,
                        singleUnionType
                    }: {
                        discriminantValue: string;
                        singleUnionType: RawSchemas.SingleUnionTypeSchema;
                    }): RuleViolation[] => {
                        const hasKey = typeof singleUnionType !== "string" && singleUnionType.key != null;
                        const type = typeof singleUnionType === "string" ? singleUnionType : singleUnionType.type;

                        if (typeof type !== "string" || hasKey) {
                            if (typeof type !== "string" && hasKey) {
                                return [
                                    {
                                        severity: "error",
                                        message: `Union variant ${discriminantValue} has no type, so "key" cannot be defined`
                                    }
                                ];
                            } else {
                                return [];
                            }
                        }

                        const resolvedType = typeResolver.resolveType({
                            type,
                            file: constructFernFileContext({
                                relativeFilepath,
                                definitionFile: contents,
                                casingsGenerator: CASINGS_GENERATOR,
                                rootApiFile: workspace.definition.rootApiFile.contents
                            })
                        });

                        if (resolvedType == null) {
                            // type doesn't exist. this will be caught by another rule
                            return [];
                        }

                        return [];
                    };

                    for (const [discriminantValue, singleUnionType] of Object.entries(declaration.union)) {
                        violations.push(
                            ...getViolationsForVariant({
                                discriminantValue,
                                singleUnionType
                            })
                        );
                    }

                    return violations;
                }
            }
        };
    }
};
