import { FernTypescriptGeneratorMode } from "@fern-typescript/commons";

export type ServiceTypesGenerationMode = Extract<FernTypescriptGeneratorMode, "client" | "server">;
