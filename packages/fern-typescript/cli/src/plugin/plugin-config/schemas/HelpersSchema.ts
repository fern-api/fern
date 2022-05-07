import { z } from "zod";

export const HelpersSchema = z.object({
    encodings: z.record(z.string()),
});

export type HelpersSchema = z.infer<typeof HelpersSchema>;
