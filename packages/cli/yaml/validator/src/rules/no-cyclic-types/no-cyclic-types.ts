import { CyclicTypeArgs, getCyclicTypes, TypeResolverImpl } from "@fern-api/ir-generator";
import { Rule } from "../../Rule";
import { getTypeDeclarationNameAsString } from "../../utils/getTypeDeclarationNameAsString";

export const NoCyclicTypesRule: Rule = {
    name: "no-cyclic-types",
    // DISABLE_RULE: false,
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            definitionFile: {
                typeDeclaration: ({ typeName, declaration }, { relativeFilepath, contents }) => {
                    const name: string = getTypeDeclarationNameAsString(typeName);
                    const args: CyclicTypeArgs = {
                        childName: name,
                        typeName: name,
                        filepathOfDeclaration: relativeFilepath,
                        definitionFile: contents,
                        workspace,
                        typeResolver,
                        smartCasing: false
                    };

                    const cyclicType = getCyclicTypes(args);

                    if (cyclicType != null) {
                        const fullPath = [name, ...cyclicType].join(" -> ");
                        return [
                            {
                                severity: "error",
                                message: `Circular type detected: ${fullPath}`
                            }
                        ];
                    }
                    return [];
                }
            }
        };
    }
};
