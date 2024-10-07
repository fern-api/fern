import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFile } from "@fern-api/conjure-sdk";
import { APIDefinitionImporter, FernDefinitionBuilderImpl } from "@fern-api/importer-commons";
import { visitConjureTypeDeclaration } from "./utils/visitConjureTypeDeclaration";
import { parseEndpointLocator, removeSuffi, getFilename, removeSuffix } from "@fern-api/core-utils";
import { listConjureFiles } from "./utils/listConjureFiles";

export declare namespace ConjureImporter {
    interface Args {
        absolutePathToConjureFolder: AbsoluteFilePath;
    }
}

export class ConjureImporter extends APIDefinitionImporter<ConjureImporter.Args> {
    private fernDefinitionBuilder = new FernDefinitionBuilderImpl(false);

    public async import({ absolutePathToConjureFolder }: ConjureImporter.Args): Promise<APIDefinitionImporter.Return> {
        const conjureFilepathToFernFilepath: Record<RelativeFilePath, RelativeFilePath> = {};
        await visitAllConjureDefinitionFiles(absolutePathToConjureFolder, (filepath, definition) => {
            for (const [serviceName, _] of Object.entries(definition.services ?? {})) {
                const unsuffixedServiceName = removeSuffix({ value: serviceName, suffix: "Service" });
                conjureFilepathToFernFilepath[filepath] = RelativeFilePath.of(`${unsuffixedServiceName}.yml`);
                return;
            }

            conjureFilepathToFernFilepath[filepath] = getFilename(filepath);
        });

        await visitAllConjureDefinitionFiles(absolutePathToConjureFolder, (filepath, definition) => {
            if (definition.services == null || Object.keys(definition.services ?? {}).length === 0) {
                this.importAllTypes({ conjureFile: definition, fernFilePath: getFilename(filepath) });
                return;
            }

            let visitedFirstService = false;
            for (const [serviceName, serviceDeclaration] of Object.entries(definition.services)) {
                const unsuffixedServiceName = removeSuffix({ value: serviceName, suffix: "Service" });
                const fernFilePath = RelativeFilePath.of(`${unsuffixedServiceName}.yml`);

                for (const [import_, importedFilepath] of Object.entries(definition.imports ?? {})) {
                    this.fernDefinitionBuilder.addImport({
                        file: fernFilePath,
                        fileToImport: RelativeFilePath.of(importedFilepath),
                        alias: import_
                    });
                }

                if (!visitedFirstService) {
                    visitedFirstService = true;
                    // import all types into the first service
                    this.importAllTypes({ conjureFile: definition, fernFilePath });
                }

                for (const [endpointName, endpointDeclaration] of Object.entries(serviceDeclaration.endpoints ?? {})) {
                    const endpointLocator = parseEndpointLocator(endpointDeclaration.http);

                    if (endpointLocator.type === "failure") {
                        this.context?.logger.error(`Failed to parse ${endpointDeclaration.http}. Skipping.`);
                        continue;
                    }

                    this.fernDefinitionBuilder.addEndpoint(fernFilePath, {
                        name: endpointName,
                        schema: {
                            auth: true,
                            path: endpointLocator.path,
                            method: endpointLocator.method,
                            response: endpointDeclaration.returns
                        },
                        source: undefined
                    });
                }
            }
        });
        return this.fernDefinitionBuilder.build();
    }

    private importAllTypes({
        conjureFile,
        fernFilePath
    }: {
        conjureFile: DefinitionFile;
        fernFilePath: RelativeFilePath;
    }): void {
        for (const [typeName, typeDeclaration] of Object.entries(conjureFile.types?.definitions?.objects ?? {})) {
            visitConjureTypeDeclaration(typeDeclaration, {
                alias: (value) => {
                    this.fernDefinitionBuilder.addType(fernFilePath, {
                        name: typeName,
                        schema: {
                            type: value.alias,
                            docs: value.docs
                        }
                    });
                },
                object: (value) => {
                    this.fernDefinitionBuilder.addType(fernFilePath, {
                        name: typeName,
                        schema: {
                            properties: value.fields
                        }
                    });
                },
                enum: (value) => {
                    this.fernDefinitionBuilder.addType(fernFilePath, {
                        name: typeName,
                        schema: {
                            enum: value.values
                        }
                    });
                },
                union: (value) => {
                    this.fernDefinitionBuilder.addType(fernFilePath, {
                        name: typeName,
                        schema: {
                            union: value.union
                        }
                    });
                }
            });
        }
    }
}

export async function visitAllConjureDefinitionFiles(
    absolutePathToConjureFolder: AbsoluteFilePath,
    visitor: (filepath: RelativeFilePath, definitionFile: DefinitionFile) => void | Promise<void>
): Promise<void> {
    for (const conjureFile of await listConjureFiles(absolutePathToConjureFolder, "{yml,yaml}")) {
        await visitor(conjureFile.relativeFilepath, conjureFile.fileContents);
    }
}
