import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir";
import { convertPackage } from "./convertPackage";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export function convert({
    openApiIr,
}: {
    openApiIr: OpenAPIIntermediateRepresentation;
}): OpenApiConvertedFernDefinition {
    let rootApiFile: RootApiFileSchema | undefined = undefined;
    let definitionFiles: Record<RelativeFilePath, DefinitionFileSchema> = {};

    if (openApiIr.rootPackage.file != null) {
        const openApiFile = openApiIr.files[openApiIr.rootPackage.file];
        if (openApiFile != null) {
            const convertedPackage = convertPackage({ openApiFile });
            if (rootApiFile == null) {
                rootApiFile = convertedPackage.rootApiFile;
            }
            definitionFiles = {
                ...definitionFiles,
                ...convertedPackage.definitionFiles,
            };
        }
    }

    // TODO(dsinghvi): should be fully recursive. Currently only exploring 1 level deep.
    for (const subPackage of openApiIr.rootPackage.subpackages) {
        if (subPackage.file != null) {
            const openApiFile = openApiIr.files[subPackage.file];
            if (openApiFile != null) {
                const convertedPackage = convertPackage({ openApiFile });
                if (rootApiFile == null) {
                    rootApiFile = convertedPackage.rootApiFile;
                }
                const prefixedDefinitionFiles = Object.fromEntries(
                    Object.entries(convertedPackage.definitionFiles).map((filepath, definitionFile) => {
                        return [`${subPackage.name}/${filepath}`, definitionFile];
                    })
                );
                definitionFiles = {
                    ...definitionFiles,
                    ...prefixedDefinitionFiles,
                };
            }
        }
    }

    if (rootApiFile == null) {
        rootApiFile = {
            name: "api",
            "error-discrimination": {
                strategy: "status-code",
            },
        };
    }

    return {
        rootApiFile,
        definitionFiles,
    };
}
