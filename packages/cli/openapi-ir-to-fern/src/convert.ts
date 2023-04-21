import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, RawSchemas, RootApiFileSchema } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir";
import { convertSecuritySchemes } from "./converters/convertSecuritySchemes";
import { ConvertedServices, convertToServices } from "./converters/convertToServices";
import { convertToTypeDeclaration } from "./converters/convertToTypeDeclaration";
import { Environment, getEnvironments } from "./getEnvironment";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export const PACKAGE_YML = RelativeFilePath.of("__package__.yml");

export const ROOT_PREFIX = "root";

export const PRODUCTION_ENVIRONMENT = "Production";

export function convert({
    openApiIr,
}: {
    openApiIr: OpenAPIIntermediateRepresentation;
}): OpenApiConvertedFernDefinition {
    const environments = getEnvironments(openApiIr);
    const convertedServices = convertToServices(openApiIr.endpoints, openApiIr.schemas, environments);
    return {
        rootApiFile: getRootApiFile(openApiIr, environments),
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
            [PACKAGE_YML]: getPackageYml(openApiIr, convertedServices),
        },
    };
}

function getRootApiFile(
    ir: OpenAPIIntermediateRepresentation,
    environment: Environment | undefined
): RootApiFileSchema {
    const authSchemes = convertSecuritySchemes(ir.securitySchemes);

    const rootApiFile: RootApiFileSchema = {
        name: "api",
        "display-name": ir.title ?? undefined,
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
        rootApiFile["default-environment"] = null;
        rootApiFile.environments = environment.environmentToUrl;
    }

    return rootApiFile;
}

function getPackageYml(
    ir: OpenAPIIntermediateRepresentation,
    convertedServices: ConvertedServices
): DefinitionFileSchema {
    let types: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    for (const [schemaId, schema] of Object.entries(ir.schemas)) {
        if (convertedServices.schemaIdsToExclude.includes(schemaId)) {
            continue;
        }
        const typeDeclaration = convertToTypeDeclaration(schema);
        types = {
            ...types,
            [schemaId]: typeDeclaration.typeDeclaration,
            ...typeDeclaration.additionalTypeDeclarations,
        };
    }
    return {
        types,
        service: convertedServices.services[PACKAGE_YML],
    };
}
