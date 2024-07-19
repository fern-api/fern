import { z } from "zod";
import { WithAvailabilitySchema } from "./WithAvailabilitySchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WithDocsAndAvailabilitySchema = WithAvailabilitySchema.extend(WithDocsSchema.shape);

export type WithDocsAndAvailabilitySchema = z.infer<typeof WithDocsAndAvailabilitySchema>;
