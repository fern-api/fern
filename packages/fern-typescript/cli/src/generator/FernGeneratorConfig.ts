import { GeneratorConfig } from "@fern-api/api";

export type FernTypescriptGeneratorConfig = Omit<GeneratorConfig, "customConfig"> & {
    customConfig: FernTypescriptGeneratorCustomConfig;
};

export interface FernTypescriptGeneratorCustomConfig {
    mode: "model" | "client" | "server" | "client_and_server";
}
