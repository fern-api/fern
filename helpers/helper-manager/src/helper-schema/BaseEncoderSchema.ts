import { z } from "zod";

export const BaseEncoderSchema = z.object({
    contentType: z.string(),
});

export type BaseEncoderSchema = z.infer<typeof BaseEncoderSchema>;
