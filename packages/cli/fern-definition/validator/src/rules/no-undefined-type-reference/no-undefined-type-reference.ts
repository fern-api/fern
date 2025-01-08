import chalk from "chalk";
import { mapValues } from "lodash-es";

import { FernWorkspace, visitAllDefinitionFiles } from "@fern-api/api-workspace-commons";
import {
    NodePath,
    isRawTextType,
    parseGeneric,
    parseRawBytesType,
    parseRawFileType,
    recursivelyVisitRawTypeReference
} from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { parseReferenceToTypeName } from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule";
import { TypeReferenceLocation, visitDefinitionFileYamlAst } from "../../ast";

type TypeName = string;

export const NoUndefinedTypeReferenceRule: Rule = {
    name: "no-undefined-type-reference",
    create: ({ workspace }) => {
        const typesByFilepath: Record<RelativeFilePath, Set<TypeName>> = getTypesByFilepath(workspace);

        function doesTypeExist(reference: ReferenceToTypeName) {
            if (reference.parsed == null) {
                return false;
            }
            const typesForFilepath = typesByFilepath[reference.parsed.relativeFilepath];
            if (typesForFilepath == null) {
                return false;
            }
            const maybeGeneric = parseGeneric(reference.parsed.typeName);
            if (maybeGeneric != null) {
                return maybeGeneric.name ? typesForFilepath.has(maybeGeneric.name) : false;
            }
            return typesForFilepath.has(reference.parsed.typeName);
        }

        function checkGenericType(reference: ReferenceToTypeName, nodePath?: NodePath) {
            if (nodePath != null) {
                const mutableNodePath = [...nodePath];
                while (mutableNodePath.length > 0) {
                    const nodePathItem = mutableNodePath.pop();
                    const maybeGeneric = nodePathItem
                        ? typeof nodePathItem === "string"
                            ? parseGeneric(nodePathItem)
                            : parseGeneric(nodePathItem.key)
                        : undefined;
                    if (maybeGeneric != null) {
                        return (
                            reference.parsed?.typeName && maybeGeneric.arguments?.includes(reference.parsed?.typeName)
                        );
                    }
                }
            }
            return false;
        }

        return {
            definitionFile: {
                typeReference: ({ typeReference, location, nodePath }, { relativeFilepath, contents }) => {
                    const parsedRawFileType = parseRawFileType(typeReference);

                    if (parsedRawFileType != null) {
                        if (location === TypeReferenceLocation.InlinedRequestProperty) {
                            return [];
                        }
                        if (location === TypeReferenceLocation.Response) {
                            if (parsedRawFileType.isOptional) {
                                return [
                                    {
                                        severity: "error",
                                        message: "File response cannot be optional"
                                    }
                                ];
                            } else {
                                return [];
                            }
                        }
                    }

                    const parsedBytesType = parseRawBytesType(typeReference);
                    if (parsedBytesType != null) {
                        if (location === TypeReferenceLocation.RequestReference) {
                            return [];
                        } else {
                            return [
                                {
                                    severity: "error",
                                    message: "The bytes type can only be used as a request"
                                }
                            ];
                        }
                    }

                    if (isRawTextType(typeReference)) {
                        if (location === TypeReferenceLocation.StreamingResponse) {
                            return [];
                        } else if (location === TypeReferenceLocation.Response) {
                            return [];
                        } else {
                            return [
                                {
                                    severity: "error",
                                    message: "The text type can only be used as a response or response-stream."
                                }
                            ];
                        }
                    }

                    const namedTypes = getAllNamedTypes({
                        type: typeReference,
                        relativeFilepath,
                        imports: mapValues(contents.imports ?? {}, RelativeFilePath.of)
                    });

                    return namedTypes.reduce<RuleViolation[]>((violations, namedType) => {
                        if (namedType.parsed?.typeName != null && parseRawFileType(namedType.parsed.typeName) != null) {
                            violations.push({
                                severity: "error",
                                message: "The file type can only be used as properties in inlined requests."
                            });
                        } else if (namedType.parsed?.typeName != null && isRawTextType(namedType.parsed.typeName)) {
                            violations.push({
                                severity: "error",
                                message: "The text type can only be used as a response-stream or response."
                            });
                        } else if (!doesTypeExist(namedType) && !checkGenericType(namedType, nodePath)) {
                            violations.push({
                                severity: "error",
                                message: `Type ${chalk.bold(
                                    namedType.parsed?.typeName ?? namedType.fullyQualifiedName
                                )} is not defined.`
                            });
                        }

                        return violations;
                    }, []);
                }
            }
        };
    }
};

function getTypesByFilepath(workspace: FernWorkspace) {
    const typesByFilepath: Record<RelativeFilePath, Set<TypeName>> = {};
    visitAllDefinitionFiles(workspace, (relativeFilepath, file) => {
        const typesForFile = new Set<TypeName>();
        typesByFilepath[relativeFilepath] = typesForFile;

        visitDefinitionFileYamlAst(file, {
            typeDeclaration: ({ typeName }) => {
                if (!typeName.isInlined) {
                    const maybeGenericDeclaration = parseGeneric(typeName.name);
                    if (maybeGenericDeclaration != null) {
                        if (maybeGenericDeclaration.name) {
                            typesForFile.add(maybeGenericDeclaration.name);
                        }
                    }
                    typesForFile.add(typeName.name);
                }
            }
        });
    });
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
    imports
}: {
    type: string;
    relativeFilepath: RelativeFilePath;
    imports: Record<string, RelativeFilePath>;
}): ReferenceToTypeName[] {
    return recursivelyVisitRawTypeReference<ReferenceToTypeName[]>({
        type,
        _default: undefined,
        validation: undefined,
        visitor: {
            primitive: () => [],
            unknown: () => [],
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
                    imports
                });
                return [
                    {
                        fullyQualifiedName: named,
                        parsed:
                            reference != null
                                ? {
                                      typeName: reference.typeName,
                                      relativeFilepath: reference.relativeFilepath
                                  }
                                : undefined
                    }
                ];
            }
        }
    });
}
