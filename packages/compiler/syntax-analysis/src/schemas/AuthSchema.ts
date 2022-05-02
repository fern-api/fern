import { z } from "zod";

export const AuthSchema = z.enum(["bearer"]);

export type AuthSchema = z.infer<typeof AuthSchema>;
