export interface ApplyContentVariantResult {
    markdown: string;
    /** `{{variant.<key>}}` placeholders that had no value for the selected variant. */
    missingValues: string[];
    /** Whether the content contained any `<Variant>` blocks. */
    hasVariantBlocks: boolean;
}

const VARIANT_BLOCK_REGEX = /<Variant\b([^>]*)>\r?\n?([\s\S]*?)\r?\n?[ \t]*<\/Variant>/g;
const NAME_ATTRIBUTE_REGEX = /\bname\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*["']([^"']*)["']\s*\})/;
const VARIANT_VALUE_REGEX = /\{\{\s*variant\.([A-Za-z0-9_-]+)\s*\}\}/g;

function parseVariantNames(attributes: string): string[] {
    const match = NAME_ATTRIBUTE_REGEX.exec(attributes);
    const raw = match?.[1] ?? match?.[2] ?? match?.[3];
    if (raw == null) {
        return [];
    }
    return raw
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
}

/**
 * Resolves content-variant syntax in a markdown page:
 * - `<Variant name="a, b">...</Variant>` blocks are unwrapped when `variantId` is listed and removed otherwise.
 * - `{{variant.<key>}}` placeholders are replaced with the matching value.
 *
 * When `variantId` is undefined every `<Variant>` block is removed and placeholders are left untouched.
 * `<Variant>` blocks cannot be nested.
 */
export function applyContentVariant({
    markdown,
    variantId,
    values = {}
}: {
    markdown: string;
    variantId: string | undefined;
    values?: Record<string, string>;
}): ApplyContentVariantResult {
    let hasVariantBlocks = false;
    let result = markdown.replace(VARIANT_BLOCK_REGEX, (_match, attributes: string, body: string) => {
        hasVariantBlocks = true;
        if (variantId != null && parseVariantNames(attributes).includes(variantId)) {
            return body;
        }
        return "";
    });

    const missingValues = new Set<string>();
    if (variantId != null) {
        result = result.replace(VARIANT_VALUE_REGEX, (match, key: string) => {
            const value = values[key];
            if (value == null) {
                missingValues.add(key);
                return match;
            }
            return value;
        });
    }

    return { markdown: result, missingValues: Array.from(missingValues), hasVariantBlocks };
}
