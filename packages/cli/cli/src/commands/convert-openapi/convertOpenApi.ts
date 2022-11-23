import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OpenApiConverter } from "@fern-api/openapi-converter";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

export async function convertOpenApiToFernApiDefinition(
    openApiPath: AbsoluteFilePath,
    fernDefinitionDir: AbsoluteFilePath,
    cliContext: CliContext
): Promise<void> {
    const openApiConverter = new OpenApiConverter({
        logger: cliContext.logger,
        openApiFilePath: openApiPath,
    });
    const convertedFernDefinition = await openApiConverter.convert();
    await mkdir(fernDefinitionDir, { recursive: true });
    await writeFile(
        `${fernDefinitionDir}/api.yml`,
        yaml.dump(convertedFernDefinition.rootApiFile, {
            noRefs: true,
        })
    );
}
