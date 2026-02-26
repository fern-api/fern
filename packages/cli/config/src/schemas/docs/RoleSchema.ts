import { z } from "zod";

export const RoleSchema = z.union([z.string(), z.array(z.string())]);

export type RoleSchema = z.infer<typeof RoleSchema>;
