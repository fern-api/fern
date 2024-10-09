import { AbsoluteFilePath, dirname, join, RelativeFilePath, relativize, getFilename } from "@fern-api/fs-utils";
import { DefinitionFile } from "@fern-api/conjure-sdk";
import { APIDefinitionImporter, FernDefinitionBuilderImpl } from "@fern-api/importer-commons";
import { visitConjureTypeDeclaration } from "./utils/visitConjureTypeDeclaration";
import { parseEndpointLocator, removeSuffix } from "@fern-api/core-utils";
import { listConjureFiles } from "./utils/listConjureFiles";
import { RawSchemas } from "@fern-api/fern-definition-schema";

export declare namespace ConjureImporter {
    interface Args {
        absolutePathToConjureFolder: AbsoluteFilePath;
        authOverrides?: RawSchemas.WithAuthSchema;
        environmentOverrides?: RawSchemas.WithEnvironmentsSchema;
        globalHeaderOverrides?: RawSchemas.WithHeadersSchema;
    }
}

export class ConjureImporter extends APIDefinitionImporter<ConjureImporter.Args> {
    private fernDefinitionBuilder = new FernDefinitionBuilderImpl(false);
    private conjureFilepathToFernFilepath: Record<RelativeFilePath, RelativeFilePath> = {};

    public async import({
        absolutePathToConjureFolder,
        authOverrides,
        environmentOverrides,
        globalHeaderOverrides
    }: ConjureImporter.Args): Promise<APIDefinitionImporter.Return> {
        if (authOverrides != null) {
            for (const [name, declaration] of Object.entries(authOverrides["auth-schemes"] ?? {})) {
                this.fernDefinitionBuilder.addAuthScheme({
                    name,
                    schema: declaration
                });
            }
            if (authOverrides.auth != null) {
                this.fernDefinitionBuilder.setAuth(authOverrides.auth);
            }
        }

        await visitAllConjureDefinitionFiles(absolutePathToConjureFolder, (absoluteFilepath, filepath, definition) => {
            for (const [serviceName, _] of Object.entries(definition.services ?? {})) {
                const unsuffixedServiceName = removeSuffix({ value: serviceName, suffix: "Service" });
                this.conjureFilepathToFernFilepath[filepath] = RelativeFilePath.of(
                    `${unsuffixedServiceName}/__package__.yml`
                );
                return;
            }

            const filename = getFilename(filepath);
            const filenameWithoutExtension = filename?.split(".")[0];
            if (filenameWithoutExtension != null) {
                this.conjureFilepathToFernFilepath[filepath] = RelativeFilePath.of(
                    `${filenameWithoutExtension}/__package__.yml`
                );
            }
        });

        await visitAllConjureDefinitionFiles(absolutePathToConjureFolder, (absoluteFilepath, filepath, definition) => {
            if (definition.services == null || Object.keys(definition.services ?? {}).length === 0) {
                const fernFilePath = this.conjureFilepathToFernFilepath[filepath];
                if (fernFilePath == null) {
                    throw new Error(`Failed to find corresponding fern filepath for conjure file ${filepath}`);
                }

                for (const [import_, importedFilepath] of Object.entries(definition.types?.conjureImports ?? {})) {
                    const fernFileToImport = this.getFernFileToImport({
                        absoluteFilePathToConjureFile: absoluteFilepath,
                        absoluteFilePathToConjureFolder: absolutePathToConjureFolder,
                        importFilePath: RelativeFilePath.of(importedFilepath)
                    });
                    this.fernDefinitionBuilder.addImport({
                        file: fernFilePath,
                        fileToImport: RelativeFilePath.of(fernFileToImport),
                        alias: import_
                    });
                }
                this.importAllTypes({ conjureFile: definition, fernFilePath });

                return;
            }

            for (const [serviceName, serviceDeclaration] of Object.entries(definition.services)) {
                const unsuffixedServiceName = removeSuffix({ value: serviceName, suffix: "Service" });
                const fernFilePath = RelativeFilePath.of(`${unsuffixedServiceName}/__package__.yml`);

                this.importAllTypes({ conjureFile: definition, fernFilePath });

                for (const [import_, importedFilepath] of Object.entries(definition.types?.conjureImports ?? {})) {
                    const fernFileToImport = this.getFernFileToImport({
                        absoluteFilePathToConjureFile: absoluteFilepath,
                        absoluteFilePathToConjureFolder: absolutePathToConjureFolder,
                        importFilePath: RelativeFilePath.of(importedFilepath)
                    });
                    this.fernDefinitionBuilder.addImport({
                        file: fernFilePath,
                        fileToImport: RelativeFilePath.of(fernFileToImport),
                        alias: import_
                    });
                }

                for (const [endpointName, endpointDeclaration] of Object.entries(serviceDeclaration.endpoints ?? {})) {
                    const endpointLocator = parseEndpointLocator(endpointDeclaration.http);

                    if (endpointLocator.type === "failure") {
                        this.context?.logger.error(`Failed to parse ${endpointDeclaration.http}. Skipping.`);
                        continue;
                    }

                    const endpoint: RawSchemas.HttpEndpointSchema = {
                        auth: true,
                        path: endpointLocator.path,
                        method: endpointLocator.method,
                        response: endpointDeclaration.returns
                    };

                    const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
                    if (endpointDeclaration.args != null) {
                        for (const pathParameter of endpointLocator.pathParameters) {
                            const pathParameterType = endpointDeclaration.args[pathParameter];
                            if (pathParameterType == null) {
                                throw new Error(
                                    `Failed to find path parameter ${pathParameter} in ${endpointDeclaration.http}`
                                );
                            }
                            pathParameters[pathParameter] =
                                typeof pathParameterType == "string"
                                    ? pathParameterType
                                    : { type: pathParameterType.type as any };
                        }
                    }

                    if (Object.entries(pathParameters).length > 0) {
                        endpoint["path-parameters"] = pathParameters;
                    }

                    this.fernDefinitionBuilder.addEndpoint(fernFilePath, {
                        name: endpointName,
                        schema: endpoint,
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
                            discriminant: "dummy",
                            union: Object.fromEntries(
                                Object.entries(value.union).map(([key, reference]) => {
                                    return [
                                        key,
                                        { type: typeof reference === "string" ? reference : reference.type, key }
                                    ];
                                })
                            )
                        }
                    });
                }
            });
        }
    }

    private getFernFileToImport({
        absoluteFilePathToConjureFile,
        importFilePath,
        absoluteFilePathToConjureFolder
    }: {
        absoluteFilePathToConjureFile: AbsoluteFilePath;
        importFilePath: RelativeFilePath;
        absoluteFilePathToConjureFolder: AbsoluteFilePath;
    }): RelativeFilePath {
        const absoluteFilePathToImportedFile = join(
            dirname(absoluteFilePathToConjureFile),
            RelativeFilePath.of(importFilePath)
        );
        const relativeFilePathToImportedFile = relativize(
            absoluteFilePathToConjureFolder,
            absoluteFilePathToImportedFile
        );
        const correspondingFernFilePath = this.conjureFilepathToFernFilepath[relativeFilePathToImportedFile];
        if (correspondingFernFilePath == null) {
            throw new Error(
                `Failed to find corresponding fern filepath for conjure file ${relativeFilePathToImportedFile}`
            );
        }
        return correspondingFernFilePath;
    }
}

export async function visitAllConjureDefinitionFiles(
    absolutePathToConjureFolder: AbsoluteFilePath,
    visitor: (
        absoluteFilepath: AbsoluteFilePath,
        filepath: RelativeFilePath,
        definitionFile: DefinitionFile
    ) => void | Promise<void>
): Promise<void> {
    for (const conjureFile of await listConjureFiles(absolutePathToConjureFolder, "{yml,yaml}")) {
        await visitor(conjureFile.absoluteFilepath, conjureFile.relativeFilepath, conjureFile.fileContents);
    }
}
