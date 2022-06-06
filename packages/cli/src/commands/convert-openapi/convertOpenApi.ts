import { convertOpenApi, OpenApiConversionFailure } from "@fern-api/openapi-converter";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";

export async function convertOpenApiToFernApiDefinition(openApiPath: string, fernDefinitionDir: string): Promise<void> {
    const conversionResult = convertOpenApi(openApiPath);
    if (conversionResult.didSucceed) {
        await mkdir(fernDefinitionDir, { recursive: true });
        await writeFile(`${fernDefinitionDir}/fern.yml`, yaml.dump(conversionResult.fernConfiguration));
    } else {
        console.error("Failed to convert Open API to Fern");
        switch (conversionResult.failure) {
            case OpenApiConversionFailure.FAILED_TO_PARSE_OPENAPI:
                console.error("Couldn't parse Open API");
        }
    }
}
