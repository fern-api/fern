import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { NOOP_LOGGER } from "@fern-api/logger";
import { ErrorCollector } from "@fern-api/v3-importer-commons";
import path from "path";
import { fileURLToPath } from "url";
import { loadTwimlDocument } from "../loadTwimlDocument.js";
import { TwimlConverter } from "../TwimlConverter.js";
import { TwimlConverterContext } from "../TwimlConverterContext.js";

const __filename = fileURLToPath(import.meta.url);
export const FIXTURES_DIR = join(AbsoluteFilePath.of(path.dirname(__filename)), RelativeFilePath.of("fixtures"));

export async function convertFixture({
    fixture,
    withExamples = true,
    examplesDir = "examples"
}: {
    fixture: string;
    withExamples?: boolean;
    examplesDir?: string;
}): Promise<{ ir: IntermediateRepresentation; errorCollector: ErrorCollector }> {
    const fixtureDir = join(FIXTURES_DIR, RelativeFilePath.of(fixture));
    const errorCollector = new ErrorCollector({ logger: NOOP_LOGGER });
    const spec = await loadTwimlDocument({
        absoluteFilepathToDefinitions: join(fixtureDir, RelativeFilePath.of("definitions")),
        absoluteFilepathToExamples: withExamples ? join(fixtureDir, RelativeFilePath.of(examplesDir)) : undefined,
        errorCollector
    });
    const context = new TwimlConverterContext({
        spec,
        logger: NOOP_LOGGER,
        generationLanguage: undefined,
        smartCasing: false,
        exampleGenerationArgs: { disabled: true },
        errorCollector,
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        settings: getOpenAPISettings()
    });
    const ir = new TwimlConverter({ context, audiences: { type: "all" } }).convert();
    return { ir, errorCollector };
}

export function errorMessages(errorCollector: ErrorCollector): string[] {
    return errorCollector.getErrors().map((error) => error.message);
}
