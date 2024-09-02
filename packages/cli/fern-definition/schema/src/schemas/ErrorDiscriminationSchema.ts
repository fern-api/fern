import { z } from "zod";
import { PropertyErrorDiscriminationSchema } from "./PropertyErrorDiscriminationSchema";
import { StatusCodeErrorDiscriminationSchema } from "./StatusCodeErrorDiscriminationSchema";

export const ErrorDiscriminationSchema = z.union([
    PropertyErrorDiscriminationSchema,
    StatusCodeErrorDiscriminationSchema
]);

export type ErrorDiscriminationSchema = z.infer<typeof ErrorDiscriminationSchema>;
