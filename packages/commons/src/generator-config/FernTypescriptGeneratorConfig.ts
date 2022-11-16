import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernTypescriptGeneratorCustomConfig } from "./FernTypescriptGeneratorCustomConfig";

export type FernTypescriptGeneratorConfig = Omit<FernGeneratorExec.GeneratorConfig, "customConfig"> & {
    customConfig: FernTypescriptGeneratorCustomConfig;
};
