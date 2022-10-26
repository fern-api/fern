import { entries, RelativeFilePath } from "@fern-api/core-utils";
import { parseReferenceToTypeName } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { visitFernServiceFileYamlAst, visitRawTypeReference } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { mapValues } from "lodash-es";
import { Rule, RuleViolation } from "../../Rule";

type TypeName = string;

export const NoUndefinedTypeReferenceRule: Rule = {
    name: "no-undefined-type-reference",
    create: async ({ workspace }) => {
        const typesByFilepath: Record<RelativeFilePath, Set<TypeName>> = await getTypesByFilepath(workspace);

        function doesTypeExist(reference: ReferenceToTypeName) {
            if (reference.parsed == null) {
                return false;
            }
            const typesForFilepath = typesByFilepath[reference.parsed.relativeFilepath];
            if (typesForFilepath == null) {
                return false;
            }
            return typesForFilepath.has(reference.parsed.typeName);
        }

        return {
            serviceFile: {
                typeReference: (typeReference, { relativeFilepath, contents }) => {
                    const type = typeof typeReference === "string" ? typeReference : typeReference.type;
                    const namedTypes = getAllNamedTypes({
                        type,
                        relativeFilepath,
                        imports: mapValues(contents.imports ?? {}, RelativeFilePath.of),
                    });

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
            },
        };
    },
};

async function getTypesByFilepath(workspace: Workspace) {
    const typesByFilepath: Record<RelativeFilePath, Set<TypeName>> = {};

    for (const [relativeFilepath, file] of entries(workspace.serviceFiles)) {
        const typesForFile = new Set<TypeName>();
        typesByFilepath[relativeFilepath] = typesForFile;

        await visitFernServiceFileYamlAst(file, {
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
              relativeFilepath: RelativeFilePath;
          }
        | undefined;
}

function getAllNamedTypes({
    type,
    relativeFilepath,
    imports,
}: {
    type: string;
    relativeFilepath: RelativeFilePath;
    imports: Record<string, RelativeFilePath>;
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
        literal: () => [],
        named: (named) => {
            const reference = parseReferenceToTypeName({
                reference: named,
                referencedIn: relativeFilepath,
                imports,
            });
            return [
                {
                    fullyQualifiedName: named,
                    parsed:
                        reference != null
                            ? {
                                  typeName: reference.typeName,
                                  relativeFilepath: reference.relativeFilepath,
                              }
                            : undefined,
                },
            ];
        },
    });
}
