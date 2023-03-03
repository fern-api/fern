import { Rule } from "../../Rule";

export const ValidTypeNameRule: Rule = {
    name: "valid-type-name",
    create: async () => {
        return {
            serviceFile: {
                typeDeclaration: ({ typeName }) => {
                    if (!typeName.charAt(0).match(/[a-zA-Z]/)) {
                        return [
                            {
                                severity: "error",
                                message: "type name must begin with a letter",
                            },
                        ];
                    }
                    return [];
                },
            },
        };
    },
};
