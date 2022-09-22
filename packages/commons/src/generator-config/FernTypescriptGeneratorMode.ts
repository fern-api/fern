import { z } from "zod";

export const FernTypescriptGeneratorModeSchema = z.enum(["model", "client", "server", "client_and_server"]);

export type FernTypescriptGeneratorMode = z.infer<typeof FernTypescriptGeneratorModeSchema>;
