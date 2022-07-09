import { z } from "zod";

export const AuthSchema = z.enum(["bearer", "none"]);

export type AuthSchema = z.infer<typeof AuthSchema>;
