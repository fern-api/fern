import { RelativeFilePath } from "@fern-api/core-utils";
import { constructFernFileContext, getPropertyName, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";

export interface ObjectPropertyWithPath {
    name: string;
    path: string[];
}

export function getAllPropertiesForObject({
    objectDeclaration,
    filepathOfDeclaration,
    serviceFile,
    workspace,
    typeResolver,
    // used only for recursive calls
    path = [],
}: {
    objectDeclaration: RawSchemas.ObjectSchema;
    filepathOfDeclaration: RelativeFilePath;
    serviceFile: RawSchemas.ServiceFileSchema;
    workspace: Workspace;
    typeResolver: TypeResolver;
    path?: string[];
}): ObjectPropertyWithPath[] {
    const properties: ObjectPropertyWithPath[] = [];

    if (objectDeclaration.properties != null) {
        for (const [propertyKey, propertyDeclaration] of Object.entries(objectDeclaration.properties)) {
            properties.push({
                name: getPropertyName({ propertyKey, declaration: propertyDeclaration }).name,
                path: [...path, propertyKey],
            });
        }
    }

    if (objectDeclaration.extends != null) {
        const extensions =
            typeof objectDeclaration.extends === "string" ? [objectDeclaration.extends] : objectDeclaration.extends;
        for (const extension of extensions) {
            const resolvedTypeOfExtension = typeResolver.resolveType({
                type: extension,
                file: constructFernFileContext({
                    relativeFilepath: filepathOfDeclaration,
                    serviceFile,
                }),
            });

            if (
                resolvedTypeOfExtension._type === "named" &&
                isRawObjectDefinition(resolvedTypeOfExtension.declaration)
            ) {
                const serviceFile = workspace.serviceFiles[resolvedTypeOfExtension.filepath];
                if (serviceFile != null) {
                    properties.push(
                        ...getAllPropertiesForObject({
                            objectDeclaration: resolvedTypeOfExtension.declaration,
                            filepathOfDeclaration: resolvedTypeOfExtension.filepath,
                            serviceFile,
                            workspace,
                            typeResolver,
                            path: [...path, ...resolvedTypeOfExtension.objectPath],
                        })
                    );
                }
            }
        }
    }

    return properties;
}
