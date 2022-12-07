import { RelativeFilePath } from "@fern-api/fs-utils";
import { constructFernFileContext, getPropertyName, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export interface ObjectPropertyWithPath {
    name: string;
    path: ObjectPropertyPath;
    finalPropertyKey: string;
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
    typeName: TypeName;
    objectDeclaration: RawSchemas.ObjectSchema;
    filepathOfDeclaration: RelativeFilePath;
    serviceFile: RawSchemas.ServiceFileSchema;
    workspace: Workspace;
    typeResolver: TypeResolver;
    path?: ObjectPropertyPath;
    seen?: Record<RelativeFilePath, Set<TypeName>>;
}): ObjectPropertyWithPath[] {
    const properties: ObjectPropertyWithPath[] = [];

    // prevent infinite looping
    const seenAtFilepath = (seen[filepathOfDeclaration] ??= new Set());
    if (seenAtFilepath.has(typeName)) {
        return properties;
    }
    seenAtFilepath.add(typeName);

    if (objectDeclaration.properties != null) {
        for (const [propertyKey, propertyDeclaration] of Object.entries(objectDeclaration.properties)) {
            properties.push({
                name: getPropertyName({ propertyKey, declaration: propertyDeclaration }).name,
                path,
                finalPropertyKey: propertyKey,
            });
        }
    }

    if (objectDeclaration.extends != null) {
        const extensions =
            typeof objectDeclaration.extends === "string" ? [objectDeclaration.extends] : objectDeclaration.extends;
        for (const extension of extensions) {
            const resolvedTypeOfExtension = typeResolver.resolveNamedType({
                referenceToNamedType: extension,
                file: constructFernFileContext({
                    relativeFilepath: filepathOfDeclaration,
                    serviceFile,
                    casingsGenerator: CASINGS_GENERATOR,
                }),
            });

            if (
                resolvedTypeOfExtension?._type === "named" &&
                isRawObjectDefinition(resolvedTypeOfExtension.declaration)
            ) {
                const serviceFile = workspace.serviceFiles[resolvedTypeOfExtension.filepath];
                if (serviceFile != null) {
                    properties.push(
                        ...getAllPropertiesForObject({
                            typeName: resolvedTypeOfExtension.name.nameV3.unsafeName.originalValue,
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
