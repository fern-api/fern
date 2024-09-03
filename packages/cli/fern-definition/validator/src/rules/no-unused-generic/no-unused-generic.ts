import { visitAllDefinitionFiles } from "@fern-api/workspace-loader";
import { visitDefinitionFileYamlAst } from "../../ast";
import { Rule, RuleViolation } from "../../Rule";
import { visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";

export const NoUnusedGenericRule: Rule = {
    name: "no-unused-generic",
    create: async ({ workspace }) => {
        const instantiations = new Set();

        await visitAllDefinitionFiles(workspace, async (relativeFilepath, file) => {
            await visitDefinitionFileYamlAst(file, {
                typeDeclaration: (type) => {
                    visitRawTypeDeclaration(type.declaration, {
                        alias: (alias) => {
                            const maybeGenericDeclaration = typeof alias === "string" ? alias : alias.type;
                            const genericMatches = maybeGenericDeclaration.match(/(\w+)<([\w,\s]+)>/);
                            if (
                                genericMatches &&
                                genericMatches[1] &&
                                !new Set(["literal", "map", "optional", "set", "list"]).has(genericMatches[1])
                            ) {
                                instantiations.add(genericMatches[1]);
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
                    const maybeGenericDeclaration = name.match(/(\w+)<([\w,\s]+)>/);
                    if (maybeGenericDeclaration?.[0] == null) {
                        return [];
                    }

                    return maybeGenericDeclaration?.[1] && instantiations.has(maybeGenericDeclaration?.[1])
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
