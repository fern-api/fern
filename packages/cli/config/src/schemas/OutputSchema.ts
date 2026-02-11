import { z } from "zod";
import { GitOutputSchema } from "./GitOutputSchema";

export const OutputSchema: z.ZodObject<
    {
        path: z.ZodOptional<z.ZodString>;
        git: z.ZodOptional<
            z.ZodObject<
                {
                    repository: z.ZodString;
                    mode: z.ZodOptional<z.ZodEnum<{ pr: "pr"; release: "release"; push: "push" }>>;
                    branch: z.ZodOptional<z.ZodString>;
                    license: z.ZodOptional<z.ZodString>;
                    reviewers: z.ZodOptional<
                        z.ZodObject<
                            {
                                teams: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                users: z.ZodOptional<z.ZodArray<z.ZodString>>;
                            },
                            z.core.$strip
                        >
                    >;
                },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
> = z.object({
    path: z.string().optional(),
    git: GitOutputSchema.optional()
});

export type OutputSchema = z.infer<typeof OutputSchema>;
