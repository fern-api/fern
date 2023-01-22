import { RelativeFilePath } from "@fern-api/fs-utils";
import { constructFernFileContext, getPropertyName, TypeResolver } from "@fern-api/ir-generator";
import { getServiceFile, Workspace } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { CASINGS_GENERATOR } from "./casingsGenerator";

export interface ObjectPropertyWithPath {
    wireKey: string;
    name: string;
    filepathOfDeclaration: RelativeFilePath;
    path: ObjectPropertyPath;
    finalPropertyKey: string;
    propertyType: string;
    // undefined if we can't locate the property type
    isOptional: boolean | undefined;
}

export type ObjectPropertyPath = ObjectPropertyPathPart[];

export interface ObjectPropertyPathPart {
    name: string;
    followedVia: "alias" | "extension";
}

export type TypeName = string;

export function getAllPropertiesForObject({
    typeName,
    objectDeclaration,
    filepathOfDeclaration,
    serviceFile,
    workspace,
    typeResolver,
    // used only for recursive calls
    path = [],
    seen = {},
}: {
    // this can be undefined for inline requests
    typeName: TypeName | undefined;
    objectDeclaration: RawSchemas.ObjectSchema;
    filepathOfDeclaration: RelativeFilePath;
    serviceFile: RawSchemas.ServiceFileSchema;
    workspace: Workspace;
    typeResolver: TypeResolver;
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

    const file = constructFernFileContext({
        relativeFilepath: filepathOfDeclaration,
        serviceFile,
        casingsGenerator: CASINGS_GENERATOR,
    });

    if (objectDeclaration.properties != null) {
        for (const [propertyKey, propertyDeclaration] of Object.entries(objectDeclaration.properties)) {
            const propertyType =
                typeof propertyDeclaration === "string" ? propertyDeclaration : propertyDeclaration.type;
            const resolvedPropertyType = typeResolver.resolveType({ type: propertyType, file });

            properties.push({
                wireKey: propertyKey,
                name: getPropertyName({ propertyKey, property: propertyDeclaration }).name,
                filepathOfDeclaration,
                path,
                finalPropertyKey: propertyKey,
                propertyType,
                isOptional:
                    resolvedPropertyType != null
                        ? resolvedPropertyType._type === "container" &&
                          resolvedPropertyType.container._type === "optional"
                        : undefined,
            });
        }
    }

    if (objectDeclaration.extends != null) {
        const extensions =
            typeof objectDeclaration.extends === "string" ? [objectDeclaration.extends] : objectDeclaration.extends;
        for (const extension of extensions) {
            const resolvedTypeOfExtension = typeResolver.resolveNamedType({
                referenceToNamedType: extension,
                file,
            });

            if (
                resolvedTypeOfExtension?._type === "named" &&
                isRawObjectDefinition(resolvedTypeOfExtension.declaration)
            ) {
                const serviceFile = getServiceFile(workspace, resolvedTypeOfExtension.filepath);
                if (serviceFile != null) {
                    properties.push(
                        ...getAllPropertiesForObject({
                            typeName: resolvedTypeOfExtension.rawName,
                            objectDeclaration: resolvedTypeOfExtension.declaration,
                            filepathOfDeclaration: resolvedTypeOfExtension.filepath,
                            serviceFile,
                            workspace,
                            typeResolver,
                            path: [
                                ...path,
                                {
                                    name: extension,
                                    followedVia: "extension",
                                },
                                ...resolvedTypeOfExtension.objectPath.map(
                                    (objectName): ObjectPropertyPathPart => ({
                                        name: objectName,
                                        followedVia: "alias",
                                    })
                                ),
                            ],
                            seen,
                        })
                    );
                }
            }
        }
    }

    return properties;
}

export function convertObjectPropertyWithPathToString({
    property,
    prefixBreadcrumbs = [],
}: {
    property: ObjectPropertyWithPath;
    prefixBreadcrumbs?: string[];
}): string {
    const parts = [
        ...prefixBreadcrumbs,
        ...convertObjectPropertyPathToStrings(property.path),
        property.finalPropertyKey,
    ];
    return parts.join(" -> ");
}

function convertObjectPropertyPathToStrings(path: ObjectPropertyPath): string[] {
    return path.map(convertObjectPropertyPathPartToString);
}

function convertObjectPropertyPathPartToString(part: ObjectPropertyPathPart): string {
    return [getPrefixForObjectPropertyPathPart(part), part.name].join(" ");
}

function getPrefixForObjectPropertyPathPart(part: ObjectPropertyPathPart): string {
    switch (part.followedVia) {
        case "alias":
            return "(alias of)";
        case "extension":
            return "(extends)";
    }
}
