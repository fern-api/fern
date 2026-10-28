/**
 * Sanitizes a preview ID to be valid in a DNS subdomain label.
 *
 * This MUST match the server-side sanitizePreviewId in FDR so the CLI can accurately predict the
 * preview URL.
 */
export function sanitizePreviewId(id: string): string {
    const sanitized = id
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "");
    if (sanitized.length === 0) {
        return "default";
    }
    return sanitized;
}
