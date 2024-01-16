import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";
import { getPropertyName } from "../converters/type-declarations/convertObjectTypeDeclaration";
import { constructFernFileContext } from "../FernFileContext";
import { ResolvedType } from "../resolvers/ResolvedType";
import { TypeResolver } from "../resolvers/TypeResolver";

export const CASINGS_GENERATOR = constructCasingsGenerator(undefined);

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
    // these are for recursive calls only
    path?: ObjectPropertyPath;
    seen?: Record<RelativeFilePath, Set<TypeName>>;
}): {
    properties: ObjectPropertyWithPath[];
    warnings: string[];
} {
    const properties: Record<string, ObjectPropertyWithPath> = {}; // keyed by name
    const warnings: string[] = [];

    // prevent infinite looping
    if (typeName != null) {
        const seenAtFilepath = (seen[filepathOfDeclaration] ??= new Set());
        if (seenAtFilepath.has(typeName)) {
            return { properties: Object.values(properties), warnings };
        }
        seenAtFilepath.add(typeName);
    }

    const file = constructFernFileContext({
        relativeFilepath: filepathOfDeclaration,
        definitionFile,
        casingsGenerator: CASINGS_GENERATOR,
        rootApiFile: workspace.definition.rootApiFile.contents
    });

    // first, add properties from any extensions
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
                    const { properties: extendedProperties, warnings: extendedWarnings } = getAllPropertiesForObject({
                        typeName: resolvedTypeOfExtension.rawName,
                        objectDeclaration: resolvedTypeOfExtension.declaration,
                        filepathOfDeclaration: resolvedTypeOfExtension.filepath,
                        definitionFile,
                        workspace,
                        typeResolver,
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
                    });
                    extendedProperties.forEach((property) => {
                        properties[property.name] = property;
                    });
                    warnings.push(...extendedWarnings);
                }
            }
        }
    }

    // then, add properties from the object itself
    if (objectDeclaration.properties != null) {
        for (const [propertyKey, propertyDeclaration] of Object.entries(objectDeclaration.properties)) {
            const propertyType =
                typeof propertyDeclaration === "string" ? propertyDeclaration : propertyDeclaration.type;
            const resolvedPropertyType = typeResolver.resolveType({ type: propertyType, file });
            if (resolvedPropertyType != null) {
                const propertyName = getPropertyName({ propertyKey, property: propertyDeclaration }).name;
                if (properties[propertyName] != null) {
                    warnings.push(
                        `Duplicate property name "${propertyName}" on object "${
                            typeName ?? "inline"
                        }" at ${filepathOfDeclaration}`
                    );
                }
                properties[propertyName] = {
                    wireKey: propertyKey,
                    name: propertyName,
                    filepathOfDeclaration,
                    path,
                    propertyType,
                    resolvedPropertyType,
                    isOptional:
                        resolvedPropertyType._type === "container" &&
                        resolvedPropertyType.container._type === "optional"
                };
            }
        }
    }

    return { properties: Object.values(properties), warnings };
}

export function getAllPropertiesForType({
    typeName,
    filepathOfDeclaration,
    definitionFile,
    workspace,
    typeResolver
}: {
    typeName: TypeName;
    filepathOfDeclaration: RelativeFilePath;
    definitionFile: RawSchemas.DefinitionFileSchema;
    workspace: FernWorkspace;
    typeResolver: TypeResolver;
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
        typeResolver
    }).properties;
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
