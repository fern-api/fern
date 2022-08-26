import { GeneratorConfig } from "@fern-fern/generator-exec-client/model/config";
import { FernTypescriptGeneratorCustomConfig } from "./FernTypescriptGeneratorCustomConfig";

export type FernTypescriptGeneratorConfig = Omit<GeneratorConfig, "customConfig"> & {
    customConfig: FernTypescriptGeneratorCustomConfig;
};
