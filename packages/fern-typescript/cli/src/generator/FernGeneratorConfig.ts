import { GeneratorConfig } from "@fern-fern/ir-model";

export type FernTypescriptGeneratorConfig = Omit<GeneratorConfig, "customConfig"> & {
    customConfig: FernTypescriptGeneratorCustomConfig;
};

export interface FernTypescriptGeneratorCustomConfig {
    mode: "model" | "client" | "server" | "client_and_server";
}
