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
                                const [_imports, typeName, ..._rest] = maybeGenericDeclaration.name.split(".");
                                instantiations.add(typeName);
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
                    const maybeGenericDeclaration = name.match(/([\w.]+)<([\w,\s]+)>/);
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
