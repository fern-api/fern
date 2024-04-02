import { z } from "zod";

export const GeneratorSnippetsSchema = z.strictObject({
    path: z.string().describe("The path to the generated snippets file.")
});

export type GeneratorSnippetsSchema = z.infer<typeof GeneratorSnippetsSchema>;
