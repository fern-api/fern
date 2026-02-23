import { z } from "zod";

export const ExperimentalConfigSchema = z.record(z.string(), z.unknown());

export type ExperimentalConfigSchema = z.infer<typeof ExperimentalConfigSchema>;
