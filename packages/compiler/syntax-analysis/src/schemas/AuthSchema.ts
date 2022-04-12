import { z } from "zod";

export const AuthSchema = z.enum(["bearer", "basic"]);

export type AuthSchema = z.infer<typeof AuthSchema>;
