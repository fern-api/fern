import { z } from "zod";

export const EncodingHandlersSchema = z.object({
    generateEncode: z.function().args(z.any()).returns(z.any()),
    generateDecode: z.function().args(z.any()).returns(z.any()),
});

export type EncodingHandlersSchema = z.infer<typeof EncodingHandlersSchema>;
