import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, RawSchemas, RootApiFileSchema } from "@fern-api/yaml-schema";
import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir";
import { convertSecuritySchemes } from "./converters/convertSecuritySchemes";
import { ConvertedServices, convertToServices } from "./converters/convertToServices";
import { convertToTypeDeclaration } from "./converters/convertToTypeDeclaration";
import { Environment, getEnvironments } from "./getEnvironment";

export const PACKAGE_YML = RelativeFilePath.of("__package__.yml");

export const ROOT_PREFIX = "root";

export const PRODUCTION_ENVIRONMENT = "Production";

export interface ConvertedPackage {
    rootApiFile: RootApiFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export function convertPackage({ openApiFile }: { openApiFile: OpenAPIFile }): ConvertedPackage {
    const environments = getEnvironments(openApiFile);
    const convertedServices = convertToServices(openApiFile, environments);
    return {
        rootApiFile: getRootApiFile(openApiFile, environments),
        definitionFiles: {
            ...Object.fromEntries(
                Object.entries(convertedServices.services).map(([file, service]) => [
                    file,
                    {
                        imports: {
                            [ROOT_PREFIX]: PACKAGE_YML.toString(),
                        },
                        service,
                    },
                ])
            ),
            [PACKAGE_YML]: getPackageYml(openApiFile, convertedServices),
        },
    };
}

function getRootApiFile(openApiFile: OpenAPIFile, environment: Environment | undefined): RootApiFileSchema {
    const authSchemes = convertSecuritySchemes(openApiFile.securitySchemes);

    const rootApiFile: RootApiFileSchema = {
        name: "api",
        "display-name": openApiFile.title ?? undefined,
        "error-discrimination": {
            strategy: "status-code",
        },
    };

    if (authSchemes.auth != null) {
        rootApiFile.auth = authSchemes.auth;
    }

    if (authSchemes.authSchemes != null) {
        rootApiFile["auth-schemes"] = authSchemes.authSchemes;
    }

    if (environment?.type === "multi") {
        rootApiFile["default-environment"] = PRODUCTION_ENVIRONMENT;
        rootApiFile.environments = {
            [PRODUCTION_ENVIRONMENT]: { urls: environment.serviceToUrl },
        };
    }

    if (environment?.type === "single") {
        rootApiFile["default-environment"] = Object.keys(environment.environmentToUrl)[0] ?? null;
        rootApiFile.environments = environment.environmentToUrl;
    }

    return rootApiFile;
}

function getPackageYml(openApiFile: OpenAPIFile, convertedServices: ConvertedServices): DefinitionFileSchema {
    let types: Record<string, RawSchemas.TypeDeclarationSchema> = { ...convertedServices.additionalTypeDeclarations };
    for (const [schemaId, schema] of Object.entries(openApiFile.schemas)) {
        if (convertedServices.schemaIdsToExclude.includes(schemaId)) {
            continue;
        }
        const typeDeclaration = convertToTypeDeclaration(schema, openApiFile.schemas);
        types = {
            ...types,
            [typeDeclaration.name ?? schemaId]: typeDeclaration.typeDeclaration,
            ...typeDeclaration.additionalTypeDeclarations,
        };
    }
    return {
        types,
        service: convertedServices.services[PACKAGE_YML],
    };
}
