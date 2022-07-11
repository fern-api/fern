import { parseReferenceToTypeName } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-parser";
import { visitFernYamlAst, visitRawTypeReference } from "@fern-api/yaml-schema";
import chalk from "chalk";
import path from "path";
import { Rule, RuleViolation } from "../../Rule";

export const NoUndefinedTypeReferenceRule: Rule = {
    name: "no-undefined-type-reference",
    create: ({ workspace }) => {
        const typesByFilepath = getTypesByFilepath(workspace);

        return {
            typeReference: (typeReference, { relativeFilePath, contents }) => {
                const typesForFilepath = typesByFilepath[relativeFilePath];
                if (typesForFilepath == null) {
                    throw new Error("Encountered unexpected file: " + relativeFilePath);
                }

                const type = typeof typeReference === "string" ? typeReference : typeReference.type;
                const namedTypes = getAllNamedTypes(type, relativeFilePath, contents.imports ?? {});

                return namedTypes.reduce<RuleViolation[]>((violations, namedType) => {
                    const typesForOtherFilepath = typesByFilepath[namedType.relativeFilePath];
                    if (typesForOtherFilepath == null) {
                        throw new Error("Encountered unexpected file: " + namedType.relativeFilePath);
                    }

                    if (!typesForOtherFilepath.has(namedType.referenceName)) {
                        violations.push({
                            severity: "error",
                            message: `Type ${chalk.bold(namedType.referenceName)} is not defined.`,
                        });
                    }

                    return violations;
                }, []);
            },
        };
    },
};

function getTypesByFilepath(workspace: Workspace) {
    const typesByFilepath: Record<string, Set<string>> = {};

    for (const [relativeFilepath, file] of Object.entries(workspace.files)) {
        const typesForFile = new Set<string>();
        typesByFilepath[relativeFilepath] = typesForFile;

        visitFernYamlAst(file, {
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
    referenceName: string;
    relativeFilePath: string;
}

function getAllNamedTypes(
    type: string,
    relativeFilePath: string,
    imports: Record<string, string>
): ReferenceToTypeName[] {
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
                    referenceName: reference.referenceName,
                    relativeFilePath: reference.relativeFilePath ?? relativeFilePath,
                },
            ];
        },
    });
}
