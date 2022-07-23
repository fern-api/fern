import { parseReferenceToTypeName } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-parser";
import { visitFernYamlAst, visitRawTypeReference } from "@fern-api/yaml-schema";
import chalk from "chalk";
import path from "path";
import { Rule, RuleViolation } from "../../Rule";

export const NoUndefinedTypeReferenceRule: Rule = {
    name: "no-undefined-type-reference",
    create: async ({ workspace }) => {
        const typesByFilepath = await getTypesByFilepath(workspace);

        function doesTypeExist(reference: ReferenceToTypeName) {
            if (reference.parsed == null) {
                return false;
            }
            const typesForFilepath = typesByFilepath[reference.parsed.relativeFilePath];
            if (typesForFilepath == null) {
                return false;
            }
            return typesForFilepath.has(reference.parsed.typeName);
        }

        return {
            typeReference: (typeReference, { relativeFilePath, contents }) => {
                const type = typeof typeReference === "string" ? typeReference : typeReference.type;
                const namedTypes = getAllNamedTypes({ type, relativeFilePath, imports: contents.imports ?? {} });

                return namedTypes.reduce<RuleViolation[]>((violations, namedType) => {
                    if (!doesTypeExist(namedType)) {
                        violations.push({
                            severity: "error",
                            message: `Type ${chalk.bold(
                                namedType.parsed?.typeName ?? namedType.fullyQualifiedName
                            )} is not defined.`,
                        });
                    }

                    return violations;
                }, []);
            },
        };
    },
};

async function getTypesByFilepath(workspace: Workspace) {
    const typesByFilepath: Record<string, Set<string>> = {};

    for (const [relativeFilepath, file] of Object.entries(workspace.files)) {
        const typesForFile = new Set<string>();
        typesByFilepath[relativeFilepath] = typesForFile;

        await visitFernYamlAst(file, {
            id: (id) => {
                typesForFile.add(typeof id === "string" ? id : id.name);
            },
            typeDeclaration: ({ typeName }) => {
                typesForFile.add(typeName);
            },
        });
    }

    return typesByFilepath;
}

interface ReferenceToTypeName {
    fullyQualifiedName: string;
    parsed:
        | {
              typeName: string;
              relativeFilePath: string;
          }
        | undefined;
}

function getAllNamedTypes({
    type,
    relativeFilePath,
    imports,
}: {
    type: string;
    relativeFilePath: string;
    imports: Record<string, string>;
}): ReferenceToTypeName[] {
    return visitRawTypeReference<ReferenceToTypeName[]>(type, {
        primitive: () => [],
        unknown: () => [],
        void: () => [],
        map: ({ keyType: namesInKeyType, valueType: namesInValueType }) => {
            return [...namesInKeyType, ...namesInValueType];
        },
        list: (namesInValueType) => namesInValueType,
        set: (namesInValueType) => namesInValueType,
        optional: (namesInValueType) => namesInValueType,
        named: (named) => {
            const reference = parseReferenceToTypeName({
                reference: named,
                relativeFilePathOfDirectory: path.dirname(relativeFilePath),
                imports,
            });
            return [
                {
                    fullyQualifiedName: named,
                    parsed:
                        reference != null
                            ? {
                                  typeName: reference.typeName,
                                  relativeFilePath: reference.relativeFilePath ?? relativeFilePath,
                              }
                            : undefined,
                },
            ];
        },
    });
}
