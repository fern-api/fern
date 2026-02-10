import { z } from "zod";
import { HeaderConfigSchema } from "./HeaderConfigSchema.js";

export const HeaderSchema = z.union([z.string(), HeaderConfigSchema]);

export type HeaderSchema = z.infer<typeof HeaderSchema>;
