import { isRawObjectDefinition } from "@fern-api/fern-definition-schema";
import { TypeResolverImpl, constructFernFileContext } from "@fern-api/ir-generator";

import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const OnlyObjectExtensionsRule: Rule = {
    name: "only-object-extensions",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            definitionFile: {
                extension: (extension, { relativeFilepath, contents }) => {
                    const resolvedType = typeResolver.resolveNamedType({
                        referenceToNamedType: extension,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile: contents,
                            rootApiFile: workspace.definition.rootApiFile.contents,
                            casingsGenerator: CASINGS_GENERATOR
                        })
                    });

                    if (resolvedType == null) {
                        // invalid type. will be caught by another rule.
                        return [];
                    }

                    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
                        return [];
                    }

                    return [
                        {
                            severity: "error",
                            message: `Objects can only extend other objects, and ${extension} is not an object.`
                        }
                    ];
                }
            }
        };
    }
};
