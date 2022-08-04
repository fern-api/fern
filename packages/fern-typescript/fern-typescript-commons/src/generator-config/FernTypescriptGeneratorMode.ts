import { z } from "zod";

export const FernTypescriptGeneratorModeSchema = z.enum([
    "model",
    "client",
    "client-v2",
    "server",
    "client_and_server",
]);

export type FernTypescriptGeneratorMode = z.infer<typeof FernTypescriptGeneratorModeSchema>;
