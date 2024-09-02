import { z } from "zod";

export const ObjectExtendsSchema = z.union([z.string(), z.array(z.string())]);

export type ObjectExtendsSchema = z.infer<typeof ObjectExtendsSchema>;
