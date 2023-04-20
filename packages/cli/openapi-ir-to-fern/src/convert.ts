import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, RawSchemas, RootApiFileSchema } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir";
import { convertSecuritySchemes } from "./converters/convertSecuritySchemes";
import { ConvertedServices, convertToServices } from "./converters/convertToServices";
import { convertToTypeDeclaration } from "./converters/convertToTypeDeclaration";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export const PACKAGE_YML = RelativeFilePath.of("__package__.yml");

export const ROOT_PREFIX = "root";

export function convert({
    openApiIr,
}: {
    openApiIr: OpenAPIIntermediateRepresentation;
}): OpenApiConvertedFernDefinition {
    const convertedServices = convertToServices(openApiIr.endpoints, openApiIr.schemas);
    return {
        rootApiFile: getRootApiFile(openApiIr),
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

function getRootApiFile(ir: OpenAPIIntermediateRepresentation): RootApiFileSchema {
    const authSchemes = convertSecuritySchemes(ir.securitySchemes);
    return {
        name: "api",
        "display-name": ir.title ?? undefined,
        ...authSchemes,
        "error-discrimination": {
            strategy: "status-code",
        },
    };
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
