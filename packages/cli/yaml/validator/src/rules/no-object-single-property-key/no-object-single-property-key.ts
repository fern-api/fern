import { constructFernFileContext, TypeResolverImpl } from "@fern-api/ir-generator";
import { isRawObjectDefinition, isRawUnionDefinition } from "@fern-api/yaml-schema";
import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const NoObjectSinglePropertyKeyRule: Rule = {
    name: "no-object-single-property-key",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);

        return {
            typeDeclaration: ({ declaration }, { relativeFilepath, contents }) => {
                const violations: RuleViolation[] = [];
                if (!isRawUnionDefinition(declaration)) {
                    return violations;
                }

                for (const [discriminantValue, singleUnionType] of Object.entries(declaration.union)) {
                    if (typeof singleUnionType !== "string" && singleUnionType.key != null) {
                        const resolvedType =
                            singleUnionType.type != null
                                ? typeResolver.resolveType({
                                      type: singleUnionType.type,
                                      file: constructFernFileContext({
                                          relativeFilepath,
                                          serviceFile: contents,
                                          casingsGenerator: CASINGS_GENERATOR,
                                      }),
                                  })
                                : undefined;
                        if (resolvedType == null || resolvedType._type === "void") {
                            violations.push({
                                severity: "error",
                                message: `Union subtype ${discriminantValue} has no body, so key cannot be defined`,
                            });
                        } else if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
                            violations.push({
                                severity: "error",
                                message: `Union subtype ${discriminantValue} extends an object, so key cannot be defined`,
                            });
                        }
                    }
                }

                return violations;
            },
        };
    },
};
