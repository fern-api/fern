import { FernWorkspace, getDefinitionFile } from "@fern-api/api-workspace-commons";
import { RawSchemas, isRawObjectDefinition } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";

import { constructFernFileContext } from "../FernFileContext";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";
import { getPropertyName } from "../converters/type-declarations/convertObjectTypeDeclaration";
import { ResolvedType } from "../resolvers/ResolvedType";
import { TypeResolver } from "../resolvers/TypeResolver";

// Note: using this exported variable is NOT recommended, but its included for convenience
// when the call-site doesn't care about the language nor special casing convention.
export const CASINGS_GENERATOR = constructCasingsGenerator({
    generationLanguage: undefined,
    keywords: undefined,
    smartCasing: false
});

export interface ObjectPropertyWithPath {
    wireKey: string;
    name: string;
    filepathOfDeclaration: RelativeFilePath;
    path: ObjectPropertyPath;
    propertyType: string;
    resolvedPropertyType: ResolvedType;
    isOptional: boolean;
}

export type ObjectPropertyPath = ObjectPropertyPathPart[];

export interface ObjectPropertyPathPart {
    reference: string;
    followedVia: "alias" | "extension";
}

export type TypeName = string;

export function getAllPropertiesForObject({
    typeName,
    objectDeclaration,
    filepathOfDeclaration,
    definitionFile,
    workspace,
    typeResolver,
    smartCasing,
    // used only for recursive calls
    path = [],
    seen = {}
}: {
    // this can be undefined for inline requests
    typeName: TypeName | undefined;
    objectDeclaration: RawSchemas.ObjectSchema;
    filepathOfDeclaration: RelativeFilePath;
    definitionFile: RawSchemas.DefinitionFileSchema;
    workspace: FernWorkspace;
    typeResolver: TypeResolver;
    smartCasing: boolean;
    // these are for recursive calls only
    path?: ObjectPropertyPath;
    seen?: Record<RelativeFilePath, Set<TypeName>>;
}): ObjectPropertyWithPath[] {
    const properties: ObjectPropertyWithPath[] = [];

    // prevent infinite looping
    if (typeName != null) {
        const seenAtFilepath = (seen[filepathOfDeclaration] ??= new Set());
        if (seenAtFilepath.has(typeName)) {
            return properties;
        }
        seenAtFilepath.add(typeName);
    }

    let casingsGenerator = CASINGS_GENERATOR;
    if (smartCasing) {
        casingsGenerator = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing
        });
    }

    const file = constructFernFileContext({
        relativeFilepath: filepathOfDeclaration,
        definitionFile,
        casingsGenerator,
        rootApiFile: workspace.definition.rootApiFile.contents
    });

    if (objectDeclaration.properties != null) {
        for (const [propertyKey, propertyDeclaration] of Object.entries(objectDeclaration.properties)) {
            const propertyType =
                typeof propertyDeclaration === "string" ? propertyDeclaration : propertyDeclaration.type;
            const resolvedPropertyType = typeResolver.resolveType({ type: propertyType, file });
            if (resolvedPropertyType != null) {
                properties.push({
                    wireKey: propertyKey,
                    name: getPropertyName({ propertyKey, property: propertyDeclaration }).name,
                    filepathOfDeclaration,
                    path,
                    propertyType,
                    resolvedPropertyType,
                    isOptional:
                        resolvedPropertyType._type === "container" &&
                        resolvedPropertyType.container._type === "optional"
                });
            }
        }
    }

    if (objectDeclaration.extends != null) {
        const extensions =
            typeof objectDeclaration.extends === "string" ? [objectDeclaration.extends] : objectDeclaration.extends;
        for (const extension of extensions) {
            const resolvedTypeOfExtension = typeResolver.resolveNamedType({
                referenceToNamedType: extension,
                file
            });

            if (
                resolvedTypeOfExtension?._type === "named" &&
                isRawObjectDefinition(resolvedTypeOfExtension.declaration)
            ) {
                const definitionFile = getDefinitionFile(workspace, resolvedTypeOfExtension.filepath);
                if (definitionFile != null) {
                    properties.push(
                        ...getAllPropertiesForObject({
                            typeName: resolvedTypeOfExtension.rawName,
                            objectDeclaration: resolvedTypeOfExtension.declaration,
                            filepathOfDeclaration: resolvedTypeOfExtension.filepath,
                            definitionFile,
                            workspace,
                            typeResolver,
                            smartCasing,
                            path: [
                                ...path,
                                {
                                    reference: extension,
                                    followedVia: "extension"
                                },
                                ...resolvedTypeOfExtension.objectPath.map(
                                    (pathItem): ObjectPropertyPathPart => ({
                                        reference: pathItem.reference,
                                        followedVia: "alias"
                                    })
                                )
                            ],
                            seen
                        })
                    );
                }
            }
        }
    }

    return properties;
}

export function getAllPropertiesForType({
    typeName,
    filepathOfDeclaration,
    definitionFile,
    workspace,
    typeResolver,
    smartCasing
}: {
    typeName: TypeName;
    filepathOfDeclaration: RelativeFilePath;
    definitionFile: RawSchemas.DefinitionFileSchema;
    workspace: FernWorkspace;
    typeResolver: TypeResolver;
    smartCasing: boolean;
}): ObjectPropertyWithPath[] {
    const resolvedType = typeResolver.resolveNamedType({
        referenceToNamedType: typeName,
        file: constructFernFileContext({
            relativeFilepath: filepathOfDeclaration,
            definitionFile,
            casingsGenerator: CASINGS_GENERATOR,
            rootApiFile: workspace.definition.rootApiFile.contents
        })
    });
    if (resolvedType == null || resolvedType._type !== "named" || !isRawObjectDefinition(resolvedType.declaration)) {
        return [];
    }
    return getAllPropertiesForObject({
        typeName,
        objectDeclaration: resolvedType.declaration,
        filepathOfDeclaration,
        definitionFile,
        workspace,
        typeResolver,
        smartCasing
    });
}

export function convertObjectPropertyWithPathToString({
    property,
    prefixBreadcrumbs = []
}: {
    property: ObjectPropertyWithPath;
    prefixBreadcrumbs?: string[];
}): string {
    const parts = [...prefixBreadcrumbs, ...convertObjectPropertyPathToStrings(property.path), property.wireKey];
    return parts.join(" -> ");
}

function convertObjectPropertyPathToStrings(path: ObjectPropertyPath): string[] {
    return path.map(convertObjectPropertyPathPartToString);
}

function convertObjectPropertyPathPartToString(part: ObjectPropertyPathPart): string {
    return [getPrefixForObjectPropertyPathPart(part), part.reference].join(" ");
}

function getPrefixForObjectPropertyPathPart(part: ObjectPropertyPathPart): string {
    switch (part.followedVia) {
        case "alias":
            return "(alias of)";
        case "extension":
            return "(extends)";
    }
}
