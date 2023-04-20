import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, RawSchemas, RootApiFileSchema } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir";
import { convertSecuritySchemes } from "./converters/convertSecuritySchemes";
import { convertToServices } from "./converters/convertToServices";
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
    const services = convertToServices(openApiIr.endpoints);
    return {
        rootApiFile: getRootApiFile(openApiIr),
        definitionFiles: {
            ...Object.fromEntries(
                Object.entries(services).map(([file, service]) => [
                    file,
                    {
                        imports: {
                            [ROOT_PREFIX]: PACKAGE_YML.toString(),
                        },
                        service,
                    },
                ])
            ),
            [PACKAGE_YML]: getPackageYml(openApiIr, services),
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
    services: Record<RelativeFilePath, RawSchemas.HttpServiceSchema>
): DefinitionFileSchema {
    let types: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    for (const [schemaId, schema] of Object.entries(ir.schemas)) {
        const typeDeclaration = convertToTypeDeclaration(schema);
        types = {
            ...types,
            [schemaId]: typeDeclaration.typeDeclaration,
            ...typeDeclaration.additionalTypeDeclarations,
        };
    }
    return {
        types,
        service: services[PACKAGE_YML],
    };
}
