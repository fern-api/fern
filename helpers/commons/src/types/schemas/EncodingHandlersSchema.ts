import { z } from "zod";

export const EncodingHandlersSchema = z.object({
    contentType: z.string(),
    generateEncode: z.function().args(z.any()).returns(z.any()),
    generateDecode: z.function().args(z.any()).returns(z.any()),
});

export type EncodingHandlersSchema = z.infer<typeof EncodingHandlersSchema>;
