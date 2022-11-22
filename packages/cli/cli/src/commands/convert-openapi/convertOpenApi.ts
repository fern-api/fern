import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertOpenApi, OpenApiConversionFailure } from "@fern-api/openapi-converter";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

export async function convertOpenApiToFernApiDefinition(
    openApiPath: AbsoluteFilePath,
    fernDefinitionDir: AbsoluteFilePath,
    cliContext: CliContext
): Promise<void> {
    const conversionResult = await convertOpenApi(openApiPath);
    if (conversionResult.didSucceed) {
        await mkdir(fernDefinitionDir, { recursive: true });
        await writeFile(
            `${fernDefinitionDir}/fern.yml`,
            yaml.dump(conversionResult.fernConfiguration, {
                noRefs: true,
            })
        );
    } else {
        // eslint-disable-next-line no-console
        console.error("Failed to convert Open API to Fern");
        switch (conversionResult.failure) {
            case OpenApiConversionFailure.FAILED_TO_PARSE_OPENAPI:
                // eslint-disable-next-line no-console
                console.error("Couldn't parse Open API");
        }
    }
}
