import { FernGeneratorExec } from "@fern-api/base-generator";
import { writeFile } from "fs/promises";

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
    const generatorOutputFilepath = (config.output as Record<string, unknown>).generatorOutputFilepath as
        | string
        | undefined;
    if (generatorOutputFilepath == null) {
        return;
    }

    const output: GeneratorOutput = {
        buildTestDockerImage
    };
    await writeFile(generatorOutputFilepath, JSON.stringify(output, null, 2) + "\n");
}
