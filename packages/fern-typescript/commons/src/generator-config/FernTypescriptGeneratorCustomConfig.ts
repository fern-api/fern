import { z } from "zod";
import { FernTypescriptGeneratorModeSchema } from "./FernTypescriptGeneratorMode";

export const FernTypescriptGeneratorCustomConfigSchema = z.strictObject({
    mode: FernTypescriptGeneratorModeSchema,
});

export type FernTypescriptGeneratorCustomConfig = z.infer<typeof FernTypescriptGeneratorCustomConfigSchema>;
