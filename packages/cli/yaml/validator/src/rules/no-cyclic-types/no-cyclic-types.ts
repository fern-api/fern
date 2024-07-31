import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    constructFernFileContext,
    getAllPropertiesForType,
    ObjectPropertyWithPath,
    TypeResolver,
    TypeResolverImpl
} from "@fern-api/ir-generator";
import {
    convertObjectPropertyWithPathToString,
    ObjectPropertyPath,
    TypeName
} from "@fern-api/ir-generator/src/utils/getAllPropertiesForObject";
import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

type CyclicTypes = Record<RelativeFilePath, CyclicType[]>;

interface CyclicType {
    startingNode: RelativeFilePath;
    chainWithoutStartingNode: RelativeFilePath[];
}

export const NoCyclicTypes: Rule = {
    name: "no-circular-imports",
    DISABLE_RULE: false,
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            definitionFile: {
                extension: (extension, { relativeFilepath, contents }) => {
                    const resolvedType = typeResolver.resolveNamedType({
                        referenceToNamedType: extension,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile: contents,
                            rootApiFile: workspace.definition.rootApiFile.contents,
                            casingsGenerator: CASINGS_GENERATOR
                        })
                    });

                    if (resolvedType == null) {
                        // invalid type. will be caught by another rule.
                        return [];
                    }

                    // pass on anything that isn't an object
                    if (resolvedType._type !== "named" || !isRawObjectDefinition(resolvedType.declaration)) {
                        return [];
                    }

                    const cyclicType = findCyclicTypes({
                        typeName: resolvedType.name.name.originalName as TypeName,
                        filepathOfDeclaration: relativeFilepath,
                        definitionFile: contents,
                        workspace,
                        typeResolver,
                        smartCasing: false
                    });

                    if (cyclicType) {
                        return [
                            {
                                severity: "error",
                                message:
                                    cyclicType.path.length === 0
                                        ? "A type cannot reference itself"
                                        : `Circular type detected: ${[
                                              cyclicType.name,
                                              convertObjectPropertyWithPathToString({
                                                  property: cyclicType
                                              }),
                                              cyclicType.name
                                          ].join(" -> ")}`
                            }
                        ];
                    }

                    return [];
                }
            }
        };
    }
};

function findCyclicTypes({
    typeName,
    filepathOfDeclaration,
    definitionFile,
    workspace,
    typeResolver,
    smartCasing,
    seen = {}
}: {
    typeName: TypeName;
    filepathOfDeclaration: RelativeFilePath;
    definitionFile: RawSchemas.DefinitionFileSchema;
    workspace: FernWorkspace;
    typeResolver: TypeResolver;
    smartCasing: boolean;
    path?: ObjectPropertyPath;
    seen?: Record<RelativeFilePath, Set<TypeName>>;
}): ObjectPropertyWithPath | null {
    const properties = getAllPropertiesForType({
        typeName,
        filepathOfDeclaration,
        definitionFile,
        workspace,
        typeResolver,
        smartCasing
    });

    for (const property of properties) {
        if (property.resolvedPropertyType._type === "named") {
            const name: TypeName = property.name as TypeName;
            const filePath: RelativeFilePath = property.filepathOfDeclaration;
            const seenAtFilepath = (seen[filepathOfDeclaration] ??= new Set());
            if (seenAtFilepath.has(name)) {
                return property;
            }
            seenAtFilepath.add(name);
            const definitionFile: RawSchemas.DefinitionFileSchema = getDefinitionFile(
                workspace,
                filePath
            ) as RawSchemas.DefinitionFileSchema;
            const foundType = findCyclicTypes({
                typeName: name,
                filepathOfDeclaration: filePath,
                definitionFile: definitionFile,
                workspace,
                typeResolver,
                smartCasing,
                seen
            });
            if (foundType) {
                foundType.path.unshift(...property.path);
                return foundType;
            }
        }
    }
    return null;
}
