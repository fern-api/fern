import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/fern-definition-schema";
import { constructCasingsGenerator } from "../casings/CasingsGenerator";
import { getPropertyName } from "../converters/type-declarations/convertObjectTypeDeclaration";
import { constructFernFileContext } from "../FernFileContext";
import { ResolvedType } from "../resolvers/ResolvedType";
import { TypeResolver } from "../resolvers/TypeResolver";
import { ObjectPropertyPath, ObjectPropertyWithPath, TypeName, getAllProperties } from "./getAllProperties";

export function getAllPropertiesForObject({
    typeName,
    filepathOfDeclaration,
    objectDeclaration,
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
    filepathOfDeclaration: RelativeFilePath;
    objectDeclaration: RawSchemas.ObjectSchema;
    definitionFile: RawSchemas.DefinitionFileSchema;
    workspace: FernWorkspace;
    typeResolver: TypeResolver;
    smartCasing: boolean;
    // these are for recursive calls only
    path?: ObjectPropertyPath;
    seen?: Record<RelativeFilePath, Set<TypeName>>;
}): ObjectPropertyWithPath[] {
    return getAllProperties({
        typeName,
        filepathOfDeclaration,
        objectProperties: objectDeclaration.properties,
        extendedTypes: objectDeclaration.extends,
        definitionFile,
        workspace,
        typeResolver,
        smartCasing,
        path,
        seen
    });
}
