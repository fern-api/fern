import { z } from "zod";

export const StatusCodeErrorDiscriminationSchema = z.object({
    strategy: z.literal("status-code")
});

export type StatusCodeErrorDiscriminationSchema = z.infer<typeof StatusCodeErrorDiscriminationSchema>;
