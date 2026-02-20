import { FernGeneratorExec } from "@fern-api/base-generator";
import { writeFile } from "fs/promises";
import path from "path";

interface GeneratorOutput {
    buildTestDockerImage?: string;
}

export async function writeGeneratorOutput({
    config,
    buildTestDockerImage
}: {
    config: FernGeneratorExec.GeneratorConfig;
    buildTestDockerImage: string | undefined;
}): Promise<void> {
    if (buildTestDockerImage == null) {
        return;
    }

    const output: GeneratorOutput = {
        buildTestDockerImage
    };
    const outputPath = path.join(config.output.path, "config.json");
    await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n");
}
