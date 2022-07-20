import { GeneratorConfig } from "@fern-fern/ir-model/generators";
import { FernTypescriptGeneratorCustomConfig } from "./FernTypescriptGeneratorCustomConfig";

export type FernTypescriptGeneratorConfig = Omit<GeneratorConfig, "customConfig"> & {
    customConfig: FernTypescriptGeneratorCustomConfig;
};
