import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { getGeneratorConfig } from "@fern-api/local-workspace-runner";

export type SdkGeneratorCLI = new () => {
    runProgrammatically: (
        ir: IntermediateRepresentation,
        generatorConfig: ReturnType<typeof getGeneratorConfig>
    ) => Promise<void>;
};

export type SdkGeneratorCLILoader = (version: string) => Promise<SdkGeneratorCLI>;
