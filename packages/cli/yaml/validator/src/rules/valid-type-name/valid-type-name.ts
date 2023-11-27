import { Rule } from "../../Rule";

const ALPHA_REGEX = /^[a-z]/i;

export const ValidTypeNameRule: Rule = {
    name: "valid-type-name",
    create: async () => {
        return {
            definitionFile: {
                typeDeclaration: ({ typeName }) => {
                    if (!typeName.isInlined && !ALPHA_REGEX.test(typeName.name)) {
                        return [
                            {
                                severity: "error",
                                message: "Type name must begin with a letter"
                            }
                        ];
                    }
                    return [];
                }
            }
        };
    }
};
