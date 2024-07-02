import { z } from "zod";

export const REVIEWERS_KEY = "reviewers";

// Overkill object right now, but at some point we might
// need to specify orgs, or other things
const ReviewerSchema = z.strictObject({
    name: z.string()
});

export const ReviewersSchema = z.strictObject({
    teams: z.optional(z.array(ReviewerSchema)),
    users: z.optional(z.array(ReviewerSchema))
});

export type ReviewersSchema = z.infer<typeof ReviewersSchema>;
