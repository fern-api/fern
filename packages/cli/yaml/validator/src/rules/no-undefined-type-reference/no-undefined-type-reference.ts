import { RelativeFilePath } from "@fern-api/fs-utils";
import { parseReferenceToTypeName } from "@fern-api/ir-generator";
import { FernWorkspace, visitAllDefinitionFiles } from "@fern-api/workspace-loader";
import {
    isRawTextType,
    parseRawBytesType,
    parseRawFileType,
    recursivelyVisitRawTypeReference,
    TypeReferenceLocation,
    visitDefinitionFileYamlAst
} from "@fern-api/yaml-schema";
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
            definitionFile: {
                typeReference: ({ typeReference, location }, { relativeFilepath, contents }) => {
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
                        } else if (!doesTypeExist(namedType)) {
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

async function getTypesByFilepath(workspace: FernWorkspace) {
    const typesByFilepath: Record<RelativeFilePath, Set<TypeName>> = {};
    await visitAllDefinitionFiles(workspace, async (relativeFilepath, file) => {
        const typesForFile = new Set<TypeName>();
        typesByFilepath[relativeFilepath] = typesForFile;

        await visitDefinitionFileYamlAst(file, {
            typeDeclaration: ({ typeName }) => {
                if (!typeName.isInlined) {
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
