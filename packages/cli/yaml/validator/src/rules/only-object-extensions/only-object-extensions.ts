import { constructFernFileContext, TypeResolverImpl } from "@fern-api/ir-generator";
import { isRawObjectDefinition, isRawDiscriminatedUnionDefinition } from "@fern-api/yaml-schema";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const OnlyObjectExtensionsRule: Rule = {
    name: "only-object-extensions",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            definitionFile: {
                extension: (extension, { relativeFilepath, contents }) => {
                    const fileContext = constructFernFileContext({
                        relativeFilepath,
                        definitionFile: contents,
                        rootApiFile: workspace.definition.rootApiFile.contents,
                        casingsGenerator: CASINGS_GENERATOR
                    });

                    const resolvedType = typeResolver.resolveNamedType({
                        referenceToNamedType: extension,
                        file: fileContext
                    });

                    if (resolvedType == null) {
                        // invalid type. will be caught by another rule.
                        return [];
                    }

                    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
                        return [];
                    }

                    if (resolvedType._type === "named" && isRawDiscriminatedUnionDefinition(resolvedType.declaration) && Object.values(resolvedType.declaration).every((d) => {
                        const resolvedOptionType = typeResolver.resolveNamedType({
                            referenceToNamedType: d.type,
                            file: fileContext,
                        });
                        return isRawObjectDefinition(resolvedOptionType.declaration);
                    })) {
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
