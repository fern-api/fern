import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { FernTypescriptGeneratorCustomConfig } from "./FernTypescriptGeneratorCustomConfig";

export type FernTypescriptGeneratorConfig = Omit<FernGeneratorExec.GeneratorConfig, "customConfig"> & {
    customConfig: FernTypescriptGeneratorCustomConfig;
};
