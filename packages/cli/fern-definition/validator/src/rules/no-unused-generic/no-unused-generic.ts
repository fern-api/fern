/* eslint-disable @typescript-eslint/no-empty-function */
import { visitAllDefinitionFiles } from "@fern-api/api-workspace-commons";
import { visitDefinitionFileYamlAst } from "../../ast";
import { Rule, RuleViolation } from "../../Rule";
import { visitRawTypeDeclaration, parseGeneric } from "@fern-api/fern-definition-schema";

export const NoUnusedGenericRule: Rule = {
    name: "no-unused-generic",
    create: async ({ workspace }) => {
        const instantiations = new Set();

        visitAllDefinitionFiles(workspace, async (_, file) => {
            await visitDefinitionFileYamlAst(file, {
                typeDeclaration: (type) => {
                    visitRawTypeDeclaration(type.declaration, {
                        alias: (alias) => {
                            const maybeGenericDeclaration = parseGeneric(
                                typeof alias === "string" ? alias : alias.type
                            );
                            if (maybeGenericDeclaration != null && maybeGenericDeclaration.name) {
                                const [maybeTypeName, typeName, ..._rest] = maybeGenericDeclaration.name.split(".");
                                const key = typeName ?? maybeTypeName;
                                if (key) {
                                    instantiations.add(key);
                                }
                            }
                        },
                        enum: () => {},
                        object: () => {},
                        discriminatedUnion: () => {},
                        undiscriminatedUnion: () => {}
                    });
                }
            });
        });

        return {
            definitionFile: {
                typeName: (name): RuleViolation[] => {
                    const maybeGenericDeclaration = parseGeneric(name);
                    if (maybeGenericDeclaration == null) {
                        return [];
                    }

                    return maybeGenericDeclaration.name && instantiations.has(maybeGenericDeclaration.name)
                        ? []
                        : [
                              {
                                  severity: "error",
                                  message: `Generic "${name}" is declared but never used.`
                              }
                          ];
                }
            }
        };
    }
};
