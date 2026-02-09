import { z } from "zod";

import { GithubLicenseCustomSchema } from "./GithubLicenseCustomSchema.js";

export const GithubLicenseSchema = z.union([z.enum(["MIT", "Apache-2.0"]), GithubLicenseCustomSchema]);

export type GithubLicenseSchema = z.infer<typeof GithubLicenseSchema>;
