import { visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { Rule } from "../../Rule";
import { validateAliasExample } from "./validateAliasExample";
import { validateEnumExample } from "./validateEnumExample";
import { validateObjectExample } from "./validateObjectExample";
import { validateUnionExample } from "./validateUnionExample";

export const ValidExampleShapeRule: Rule = {
    name: "valid-example",
    create: () => {
        return {
            serviceFile: {
                typeExample: ({ typeDeclaration, example }) => {
                    return visitRawTypeDeclaration(typeDeclaration, {
                        alias: () => {
                            return validateAliasExample();
                        },
                        enum: (rawEnum) => {
                            return validateEnumExample({
                                rawEnum,
                                example,
                            });
                        },
                        object: () => {
                            return validateObjectExample();
                        },
                        union: () => {
                            return validateUnionExample();
                        },
                    });
                },
            },
        };
    },
};
