import { z } from "zod";
import { NumberValidationSchema } from "./NumberValidationSchema";
import { StringValidationSchema } from "./StringValidationSchema";

export const ValidationSchema = z.union([StringValidationSchema, NumberValidationSchema]);

export type ValidationSchema = z.infer<typeof ValidationSchema>;
