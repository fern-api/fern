import { z } from "zod";
import { GitOutputModeSchema } from "./GitOutputModeSchema";
import { LicenseSchema } from "./LicenseSchema";
import { ReviewersSchema } from "./ReviewersSchema";

export const GitOutputSchema: z.ZodObject<
    {
        repository: z.ZodString;
        mode: z.ZodOptional<z.ZodEnum<{ pr: "pr"; release: "release"; push: "push" }>>;
        branch: z.ZodOptional<z.ZodString>;
        license: z.ZodOptional<z.ZodString>;
        reviewers: z.ZodOptional<
            z.ZodObject<
                { teams: z.ZodOptional<z.ZodArray<z.ZodString>>; users: z.ZodOptional<z.ZodArray<z.ZodString>> },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
> = z.object({
    repository: z.string(),
    mode: GitOutputModeSchema.optional(),
    branch: z.string().optional(),
    license: LicenseSchema.optional(),
    reviewers: ReviewersSchema.optional()
});

export type GitOutputSchema = z.infer<typeof GitOutputSchema>;
