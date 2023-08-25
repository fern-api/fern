import { RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DefinitionFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir";
import { convertPackage } from "./convertPackage";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

export interface OpenApiConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
}

export function convert({
    openApiIr,
    taskContext,
}: {
    taskContext: TaskContext;
    openApiIr: OpenAPIIntermediateRepresentation;
}): OpenApiConvertedFernDefinition {
    const context = new OpenApiIrConverterContext({ taskContext });
    let rootApiFile: RootApiFileSchema | undefined = undefined;
    let definitionFiles: Record<RelativeFilePath, DefinitionFileSchema> = {};

    if (openApiIr.rootPackage.file != null) {
        const openApiFile = openApiIr.files[openApiIr.rootPackage.file];
        if (openApiFile != null) {
            const convertedPackage = convertPackage({ openApiFile, context });
            rootApiFile = convertedPackage.rootApiFile;
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
                const convertedPackage = convertPackage({ openApiFile, context });
                if (rootApiFile == null) {
                    rootApiFile = convertedPackage.rootApiFile;
                }
                const prefixedDefinitionFiles = Object.fromEntries(
                    Object.entries(convertedPackage.definitionFiles).map(([filepath, definitionFile]) => {
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
