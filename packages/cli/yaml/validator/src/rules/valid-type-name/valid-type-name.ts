import { Rule } from "../../Rule";

const ALPHA_REGEX = /^[a-z]/i;

export const ValidTypeNameRule: Rule = {
    name: "valid-type-name",
    create: async () => {
        return {
            serviceFile: {
                typeDeclaration: ({ typeName }) => {
                    if (!ALPHA_REGEX.test(typeName)) {
                        return [
                            {
                                severity: "error",
                                message: "Type name must begin with a letter",
                            },
                        ];
                    }
                    return [];
                },
            },
        };
    },
};
