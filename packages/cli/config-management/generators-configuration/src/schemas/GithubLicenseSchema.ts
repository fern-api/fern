import { z } from "zod";
import { GithubLicenseCustomSchema } from "./GithubLicenseCustomSchema";

export const GithubLicenseSchema = z.union([z.string(), GithubLicenseCustomSchema]);

export type GithubLicenseSchema = z.infer<typeof GithubLicenseSchema>;
