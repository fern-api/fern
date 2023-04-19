import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, RawSchemas, RootApiFileSchema } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir";
import { convertSecuritySchemes } from "./converters/convertSecuritySchemes";
import { convertToTypeDeclaration } from "./converters/convertToTypeDeclaration";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export function convert({
    openApiIr,
}: {
    openApiIr: OpenAPIIntermediateRepresentation;
}): OpenApiConvertedFernDefinition {
    const packageYmlRelativeFilepath = RelativeFilePath.of("__package__.yml");
    return {
        rootApiFile: getRootApiFile(openApiIr),
        definitionFiles: {
            [packageYmlRelativeFilepath]: getPackageYml(openApiIr),
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

function getPackageYml(ir: OpenAPIIntermediateRepresentation): DefinitionFileSchema {
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
    };
}
