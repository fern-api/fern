import { visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";

import { Rule, RuleViolation } from "../../Rule.js";
import { validateEnumNames } from "./validateEnumNames.js";
import { validateUnionNames } from "./validateUnionNames.js";

export const ValidFieldNamesRule: Rule = {
    name: "valid-field-names",
    create: (context) => {
        const hasOpenAPISource = context.workspace.sources.some((source) => source.type === "openapi");
        return {
            definitionFile: {
                typeDeclaration: ({ declaration }) => {
                    return visitRawTypeDeclaration<RuleViolation[]>(declaration, {
                        alias: () => [],
                        enum: (enumDeclaration) => validateEnumNames(enumDeclaration, { hasOpenAPISource }),
                        object: () => [],
                        undiscriminatedUnion: () => [],
                        discriminatedUnion: validateUnionNames
                    });
                }
            }
        };
    }
};
