import { DefinitionFile } from "@fern-api/conjure-sdk";
import { parseEndpointLocator, removeSuffix } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, RelativeFilePath, dirname, getFilename, join, relativize } from "@fern-api/fs-utils";
import { APIDefinitionImporter, FernDefinitionBuilderImpl, HttpServiceInfo } from "@fern-api/importer-commons";

import { listConjureFiles } from "./utils/listConjureFiles";
import { visitConjureTypeDeclaration } from "./utils/visitConjureTypeDeclaration";

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

        if (environmentOverrides != null) {
            for (const [environment, environmentDeclaration] of Object.entries(
                environmentOverrides.environments ?? {}
            )) {
                this.fernDefinitionBuilder.addEnvironment({
                    name: environment,
                    schema: environmentDeclaration
                });
            }
            if (environmentOverrides["default-environment"] != null) {
                this.fernDefinitionBuilder.setDefaultEnvironment(environmentOverrides["default-environment"]);
            }
            if (environmentOverrides["default-url"] != null) {
                this.fernDefinitionBuilder.setDefaultUrl(environmentOverrides["default-url"]);
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

                const httpServiceInfo: HttpServiceInfo = {};
                if (serviceDeclaration.basePath != null) {
                    httpServiceInfo["base-path"] = serviceDeclaration.basePath;
                }
                if (serviceDeclaration.docs != null) {
                    httpServiceInfo.docs = serviceDeclaration.docs;
                }
                this.fernDefinitionBuilder.setServiceInfo(fernFilePath, httpServiceInfo);

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
                        response: endpointDeclaration.returns === "binary" ? "file" : endpointDeclaration.returns
                    };

                    if (endpointDeclaration.docs != null) {
                        endpoint.docs = endpointDeclaration.docs;
                    }

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
                                typeof pathParameterType === "string"
                                    ? pathParameterType
                                    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      { type: pathParameterType.type as any };
                        }
                    }

                    if (Object.entries(pathParameters).length > 0) {
                        endpoint["path-parameters"] = pathParameters;
                    }

                    for (const [arg, argDeclaration] of Object.entries(endpointDeclaration.args ?? {})) {
                        if (pathParameters[arg] != null) {
                            continue;
                        }
                        if (typeof argDeclaration === "string") {
                            if (!endpoint.request) {
                                endpoint.request = {};
                            } else if (typeof endpoint.request === "string") {
                                endpoint.request = { body: endpoint.request };
                            }
                            endpoint.request.body = argDeclaration === "binary" ? "bytes" : argDeclaration;
                        } else {
                            switch (argDeclaration.paramType) {
                                case "body":
                                    endpoint.request = {
                                        body: argDeclaration.type === "binary" ? "bytes" : argDeclaration.type
                                    };
                                    break;
                                case "query": {
                                    if (endpoint.request == null) {
                                        endpoint.request = { "query-parameters": { [arg]: argDeclaration.type } };
                                    } else if (
                                        typeof endpoint.request !== "string" &&
                                        endpoint.request?.["query-parameters"] == null
                                    ) {
                                        endpoint.request["query-parameters"] = { [arg]: argDeclaration.type };
                                    } else if (
                                        typeof endpoint.request !== "string" &&
                                        endpoint.request?.["query-parameters"] != null
                                    ) {
                                        endpoint.request["query-parameters"][arg] = argDeclaration.type;
                                    }
                                }
                            }
                        }
                    }

                    if (
                        endpoint.request != null &&
                        typeof endpoint.request !== "string" &&
                        endpoint.request?.["query-parameters"] != null
                    ) {
                        endpoint.request.name = `${endpointName}Request`;
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
                            union: Object.fromEntries(
                                Object.entries(value.union).map(([key, type]) => {
                                    return [
                                        key,
                                        {
                                            type: typeof type === "string" ? type : type.type,
                                            docs: typeof type === "string" ? undefined : type.docs,
                                            key
                                        }
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
