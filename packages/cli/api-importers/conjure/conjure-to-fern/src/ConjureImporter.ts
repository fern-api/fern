import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import {
    ConjureTypeDeclaration,
    DefinitionFile,
    ConjureAliasDeclaration,
    ConjureObjectDeclaration,
    ConjureEnumDeclaration
} from "@fern-api/conjure-sdk";
import { APIDefinitionImporter, FernDefinitionBuilderImpl } from "@fern-api/importer-commons";
import { listConjureFiles } from "./listConjureFiles";

export declare namespace ConjureImporter {
    interface Args {
        absolutePathToConjureFolder: AbsoluteFilePath;
    }
}

export class ConjureImporter extends APIDefinitionImporter<ConjureImporter.Args> {
    private fernDefinitionBuilder = new FernDefinitionBuilderImpl(false);

    public async import({ absolutePathToConjureFolder }: ConjureImporter.Args): Promise<APIDefinitionImporter.Return> {
        await visitAllConjureDefinitionFiles(absolutePathToConjureFolder, (filepath, definition) => {
            for (const [import_, importedFilepath] of Object.entries(definition.imports ?? {})) {
                this.fernDefinitionBuilder.addImport({
                    file: filepath,
                    fileToImport: RelativeFilePath.of(importedFilepath),
                    alias: import_
                });
            }

            for (const [typeName, typeDeclaration] of Object.entries(definition.types?.definitions?.objects ?? {})) {
                if (isAlias(typeDeclaration)) {
                    this.fernDefinitionBuilder.addType(filepath, {
                        name: typeName,
                        schema: {
                            type: typeDeclaration.alias,
                            docs: typeDeclaration.docs
                        }
                    });
                } else if (isObject(typeDeclaration)) {
                    this.fernDefinitionBuilder.addType(filepath, {
                        name: typeName,
                        schema: {
                            properties: typeDeclaration.fields
                        }
                    });
                } else if (isEnum(typeDeclaration)) {
                    this.fernDefinitionBuilder.addType(filepath, {
                        name: typeName,
                        schema: {
                            enum: typeDeclaration.values
                        }
                    });
                }
            }

            for (const [serviceName, serviceDeclaration] of Object.entries(definition.services ?? {})) {
                for (const [endpointName, endpointDeclaration] of Object.entries(serviceDeclaration.endpoints ?? {})) {
                    const splitConjurePath = endpointDeclaration.http.split(" ");
                    const method = splitConjurePath[1];
                    const path = splitConjurePath[0];
                    if (method == null || path == null) {
                        break;
                    }
                    this.fernDefinitionBuilder.addEndpoint(filepath, {
                        name: endpointName,
                        schema: {
                            auth: true,
                            path,
                            method: method as any,
                            response: endpointDeclaration.returns
                        },
                        source: undefined
                    });
                }
            }
        });
        return this.fernDefinitionBuilder.build();
    }
}

export async function visitAllConjureDefinitionFiles(
    absolutePathToConjureFolder: AbsoluteFilePath,
    visitor: (filepath: RelativeFilePath, definitionFile: DefinitionFile) => void | Promise<void>
): Promise<void> {
    for (const conjureFile of await listConjureFiles(absolutePathToConjureFolder, `{yml,yaml}`)) {
        await visitor(conjureFile.relativeFilepath, conjureFile.fileContents);
    }
}

function isAlias(type: ConjureTypeDeclaration): type is ConjureAliasDeclaration {
    return (type as ConjureAliasDeclaration)?.alias != null;
}

function isEnum(type: ConjureTypeDeclaration): type is ConjureEnumDeclaration {
    return (type as ConjureEnumDeclaration)?.values != null;
}

function isObject(type: ConjureTypeDeclaration): type is ConjureObjectDeclaration {
    return (type as ConjureObjectDeclaration)?.fields != null;
}
