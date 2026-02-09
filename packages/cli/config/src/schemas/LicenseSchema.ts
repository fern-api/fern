import { z } from "zod";

/** Well-known license identifiers that don't need a file path */
export const WELL_KNOWN_LICENSES = ["MIT", "Apache-2.0"] as const;

export type WellKnownLicense = (typeof WELL_KNOWN_LICENSES)[number];

export function isWellKnownLicense(license: string): license is WellKnownLicense {
    return WELL_KNOWN_LICENSES.includes(license as WellKnownLicense);
}

/**
 * License configuration for GitHub output.
 *  - "MIT" or "Apache-2.0" for well-known licenses
 *  - Any other string is treated as a file path (e.g., "./LICENSE")
 */
export const LicenseSchema = z.string();

export type LicenseSchema = z.infer<typeof LicenseSchema>;
