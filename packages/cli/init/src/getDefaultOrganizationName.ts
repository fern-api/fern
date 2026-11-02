import { getOrganizationNameValidationError } from "@fern-api/auth";
import path from "path";

const FALLBACK_ORGANIZATION_NAME = "my-org";

/**
 * The organization a non-interactive `fern init` uses when nothing names one: no `--organization`, no `fern.config.json`
 * and no login to read it from. Derived from the project directory's name so the generated docs title and URL still
 * say something about the project; a guest run swaps it for the guest organization anyway.
 */
export function getDefaultOrganizationName(projectDirectory: string): string {
    const candidate = path
        .basename(projectDirectory)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return getOrganizationNameValidationError(candidate) == null ? candidate : FALLBACK_ORGANIZATION_NAME;
}
