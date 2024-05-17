import { z } from "zod";
import { NumberValidationSchema } from "./NumberValidationSchema";
import { StringValidationSchema } from "./StringValidationSchema";

export const ValidationSchema = z.union([NumberValidationSchema, StringValidationSchema]);

export type ValidationSchema = z.infer<typeof ValidationSchema>;
