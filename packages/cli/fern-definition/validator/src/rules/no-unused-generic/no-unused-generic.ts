/* eslint-disable @typescript-eslint/no-empty-function */
import { visitAllDefinitionFiles } from "@fern-api/workspace-loader";
import { visitDefinitionFileYamlAst } from "../../ast";
import { Rule, RuleViolation } from "../../Rule";
import { visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";
import { getGenericDetails } from "../../utils/getGenericDetails";

export const NoUnusedGenericRule: Rule = {
    name: "no-unused-generic",
    create: async ({ workspace }) => {
        const instantiations = new Set();

        await visitAllDefinitionFiles(workspace, async (_, file) => {
            await visitDefinitionFileYamlAst(file, {
                typeDeclaration: (type) => {
                    visitRawTypeDeclaration(type.declaration, {
                        alias: (alias) => {
                            const maybeGenericDeclaration = getGenericDetails(
                                typeof alias === "string" ? alias : alias.type
                            );
                            if (maybeGenericDeclaration?.isGeneric && maybeGenericDeclaration.name) {
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
                    const maybeGenericDeclaration = getGenericDetails(name);
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
