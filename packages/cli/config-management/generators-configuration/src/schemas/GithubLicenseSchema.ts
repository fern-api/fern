import { z } from "zod";

export const GithubLicenseSchema = z.union([z.enum(["MIT", "Apache-2.0"]), z.string()]);

export type GithubLicenseSchema = z.infer<typeof GithubLicenseSchema>;
