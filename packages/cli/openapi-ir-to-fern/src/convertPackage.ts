import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import {
    DefinitionFileSchema,
    isRawAliasDefinition,
    PackageMarkerFileSchema,
    RawSchemas,
    RootApiFileSchema
} from "@fern-api/yaml-schema";
import { TagId } from "@fern-fern/openapi-ir-model/commons";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/finalIr";
import { difference } from "lodash-es";
import { convertSecuritySchemes } from "./converters/convertSecuritySchemes";
import { ConvertedServices, convertToServices } from "./converters/convertToServices";
import { convertToTypeDeclaration } from "./converters/convertToTypeDeclaration";
import { convertPrimitiveToTypeReference, convertToTypeReference } from "./converters/convertToTypeReference";
import { convertWebhooks } from "./converters/convertWebhooks";
import { getTypeFromTypeReference } from "./converters/utils/getTypeFromTypeReference";
import { Environments, getEnvironments } from "./getEnvironments";
import { getGlobalHeaders } from "./getGlobalHeaders";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

export const ROOT_PREFIX = "root";

export const PRODUCTION_ENVIRONMENT = "Production";

export const EXTERNAL_AUDIENCE = "external";

export interface ConvertedPackage {
    rootApiFile: RootApiFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
    packageMarkerFile: PackageMarkerFileSchema;
}

export function convertPackage({
    openApiFile,
    context
}: {
    openApiFile: OpenAPIIntermediateRepresentation;
    context: OpenApiIrConverterContext;
}): ConvertedPackage {
    const environments = getEnvironments(openApiFile);
    const rootApiFile = getRootApiFile(openApiFile, environments);
    const convertedServices = convertToServices({
        openApiFile,
        environments,
        globalHeaderNames: new Set(Object.keys(rootApiFile.headers ?? {}))
    });
    const convertedWebhooks = convertWebhooks({
        openApiFile,
        context
    });
    const onlyWebhookFiles = Object.fromEntries(
        Object.entries(convertedWebhooks?.webhooks ?? {}).filter(([file, _webhook]) => {
            return !(file in convertedServices.services);
        })
    );

    const tagIdsByFiles: Record<TagId, RelativeFilePath> = {};
    const relativeFilepaths: RelativeFilePath[] = [];
    const navigation: string[] = [];

    const definitionFiles: Record<RelativeFilePath, DefinitionFileSchema> = {
        ...Object.fromEntries(
            Object.entries(convertedServices.services).map(([file, service]) => {
                const filepath = RelativeFilePath.of(file);
                if (service.associatedTag != null) {
                    tagIdsByFiles[service.associatedTag.id] = filepath;
                }
                if (filepath.split("/").length === 1 && !filepath.includes(FERN_PACKAGE_MARKER_FILENAME)) {
                    relativeFilepaths.push(filepath);
                }
                const definitionFile: DefinitionFileSchema = {
                    imports: {
                        [ROOT_PREFIX]: getRootImportPrefixFromFile(file)
                    },
                    service: service.value
                };
                const maybeWebhooks = convertedWebhooks?.webhooks[RelativeFilePath.of(file)];
                if (maybeWebhooks != null) {
                    definitionFile.webhooks = maybeWebhooks;
                }
                if (service.docs != null) {
                    definitionFile.docs = service.docs;
                }
                return [file, definitionFile];
            })
        ),
        ...Object.fromEntries(
            Object.entries(onlyWebhookFiles).map(([file, webhooks]) => {
                const definitionFile: DefinitionFileSchema = {
                    imports: {
                        [ROOT_PREFIX]: getRootImportPrefixFromFile(file)
                    },
                    webhooks
                };
                return [file, definitionFile];
            })
        )
    };

    if (openApiFile.tags.orderedTagIds != null) {
        context.logger.info("associated tag is null");
        const visited: RelativeFilePath[] = [];
        for (const tagId of openApiFile.tags.orderedTagIds) {
            const filepath = tagIdsByFiles[tagId];
            if (filepath != null) {
                navigation.push(filepath);
                visited.push(filepath);
            }
        }
        const remainingFilesToAdd = difference(relativeFilepaths, visited);
        navigation.push(...remainingFilesToAdd);
    }

    const packageMarkerFile = getPackageYml(openApiFile, convertedServices);
    if (navigation.length > 0) {
        packageMarkerFile.navigation = navigation;
    }

    return {
        rootApiFile,
        definitionFiles,
        packageMarkerFile
    };
}

function getRootImportPrefixFromFile(file: string): string {
    const numDirectoriesNested = file.split("/").length - 1;
    let importPrefix = "";
    for (let i = 0; i < numDirectoriesNested; ++i) {
        importPrefix += "../";
    }
    return `${importPrefix}${FERN_PACKAGE_MARKER_FILENAME}`;
}

function getRootApiFile(
    openApiFile: OpenAPIIntermediateRepresentation,
    environment: Environments | undefined
): RootApiFileSchema {
    const authSchemes = convertSecuritySchemes(openApiFile.securitySchemes);
    const globalHeaders = getGlobalHeaders(openApiFile);

    const rootApiFile: RootApiFileSchema = {
        imports: {
            root: "__package__.yml"
        },
        name: "api",
        "display-name": openApiFile.title ?? undefined,
        "error-discrimination": {
            strategy: "status-code"
        }
    };

    if (Object.keys(globalHeaders).length > 0) {
        rootApiFile.headers = globalHeaders;
    }

    if (authSchemes.auth != null) {
        rootApiFile.auth = authSchemes.auth;
    }

    if (authSchemes.authSchemes != null) {
        rootApiFile["auth-schemes"] = authSchemes.authSchemes;
    }

    for (const [headerKey, headerSchema] of Object.entries(authSchemes.globalHeaders)) {
        if (rootApiFile.headers == null) {
            rootApiFile.headers = {};
        }
        rootApiFile.headers[headerKey] = headerSchema;
    }

    if (environment?.type === "multi") {
        rootApiFile["default-environment"] = PRODUCTION_ENVIRONMENT;
        rootApiFile.environments = {
            [PRODUCTION_ENVIRONMENT]: { urls: environment.serviceToUrl }
        };
    }

    if (environment?.type === "single") {
        rootApiFile["default-environment"] = Object.keys(environment.environmentToUrl)[0] ?? null;
        rootApiFile.environments = environment.environmentToUrl;
    }

    if (Object.keys(openApiFile.variables).length > 0) {
        rootApiFile.variables = Object.fromEntries(
            Object.entries(openApiFile.variables).map(([variableName, variableSchema]) => {
                const convertedSchema = convertPrimitiveToTypeReference(variableSchema);
                return [
                    variableName,
                    {
                        type: getTypeFromTypeReference(convertedSchema.typeReference),
                        docs: variableSchema.description ?? undefined
                    }
                ];
            })
        );
    }

    if (openApiFile.hasEndpointsMarkedInternal) {
        rootApiFile.audiences = [EXTERNAL_AUDIENCE];
    }

    return rootApiFile;
}

function getPackageYml(
    openApiFile: OpenAPIIntermediateRepresentation,
    convertedServices: ConvertedServices
): RawSchemas.PackageMarkerFileSchema {
    let types: Record<string, RawSchemas.TypeDeclarationSchema> = { ...convertedServices.additionalTypeDeclarations };
    for (const [schemaId, schema] of Object.entries(openApiFile.schemas)) {
        if (convertedServices.schemaIdsToExclude.includes(schemaId)) {
            continue;
        }
        const typeDeclaration = convertToTypeDeclaration(schema, openApiFile.schemas);
        // HACKHACK: Skip self-referencing schemas. I'm not sure if this is the right way to do this.
        if (isRawAliasDefinition(typeDeclaration.typeDeclaration)) {
            const aliasType =
                typeof typeDeclaration.typeDeclaration === "string"
                    ? typeDeclaration.typeDeclaration
                    : typeDeclaration.typeDeclaration.type;
            if (typeDeclaration.name === aliasType) {
                continue;
            }
        }
        types = {
            ...types,
            [typeDeclaration.name ?? schemaId]: typeDeclaration.typeDeclaration,
            ...typeDeclaration.additionalTypeDeclarations
        };
    }
    const errors: Record<string, RawSchemas.ErrorDeclarationSchema> = {};
    for (const [statusCode, httpError] of Object.entries(openApiFile.errors)) {
        const errorDeclaration: RawSchemas.ErrorDeclarationSchema = {
            "status-code": parseInt(statusCode)
        };
        if (httpError.schema != null) {
            const typeReference = convertToTypeReference({ schema: httpError.schema, schemas: openApiFile.schemas });
            errorDeclaration.type = getTypeFromTypeReference(typeReference.typeReference);
            types = {
                ...types,
                ...typeReference.additionalTypeDeclarations
            };
        }
        errors[httpError.generatedName] = errorDeclaration;
    }
    return {
        types,
        service: convertedServices.services[RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)]?.value,
        errors
    };
}
