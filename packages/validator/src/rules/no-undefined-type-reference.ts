import { parseInlineType } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-parser";
import { ContainerType, DeclaredTypeName, TypeReference } from "@fern-fern/ir-model";
import path from "path";
import { visitAst } from "../ast/visitAst";
import { Rule, RuleViolation } from "../Rule";

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
                const parsedType = parseInlineType({
                    type,
                    fernFilepath: relativeFilePath.split(path.sep),
                    imports: contents.imports ?? {},
                });
                const namedTypes = getAllNamedTypes(parsedType);

                return namedTypes.reduce<RuleViolation[]>((violations, namedType) => {
                    const filepathForOtherType = namedType.fernFilepath.join(path.sep);
                    const typesForOtherFilepath = typesByFilepath[filepathForOtherType];
                    if (typesForOtherFilepath == null) {
                        throw new Error("Encountered unexpected file: " + filepathForOtherType);
                    }

                    if (!typesForOtherFilepath.has(namedType.name)) {
                        violations.push({
                            severity: "error",
                            message: `Type ${namedType.name} is not defined.`,
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

        visitAst(file, {
            typeDeclaration: ({ typeName }) => {
                typesForFile.add(typeName);
            },
        });
    }

    return typesByFilepath;
}

function getAllNamedTypes(typeReference: TypeReference): DeclaredTypeName[] {
    return TypeReference._visit(typeReference, {
        container: (container) =>
            ContainerType._visit(container, {
                map: ({ keyType, valueType }) => [...getAllNamedTypes(keyType), ...getAllNamedTypes(valueType)],
                list: getAllNamedTypes,
                set: getAllNamedTypes,
                optional: getAllNamedTypes,
                _unknown: () => [],
            }),
        named: (named) => [named],
        primitive: () => [],
        void: () => [],
        unknown: () => [],
        _unknown: () => [],
    });
}
