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

// Fenced code blocks (``` or ~~~) and inline code spans, matched so that `<Variant>` tags
// written as literal examples inside them are left alone.
const CODE_REGEX = /^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n[ \t]*\1[ \t]*$|`+[^`\n]+`+/gm;
const CODE_TOKEN_REGEX = /\uE000fern-variant-code:(\d+)\uE000/g;

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

function protectCode(markdown: string): { markdown: string; code: string[] } {
    const code: string[] = [];
    const protectedMarkdown = markdown.replace(CODE_REGEX, (match) => {
        code.push(match);
        return `\uE000fern-variant-code:${code.length - 1}\uE000`;
    });
    return { markdown: protectedMarkdown, code };
}

function restoreCode(markdown: string, code: string[]): string {
    return markdown.replace(CODE_TOKEN_REGEX, (match, index: string) => code[Number(index)] ?? match);
}

/**
 * Resolves content-variant syntax in a markdown page:
 * - `<Variant name="a, b">...</Variant>` blocks are unwrapped when `variantId` is listed and removed otherwise.
 *   Tags inside fenced code blocks or inline code are treated as literal text.
 * - `{{variant.<key>}}` placeholders are replaced with the matching value everywhere, including
 *   frontmatter and code blocks, so variant-specific commands and paths can be substituted.
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
    const protectedMarkdown = protectCode(markdown);
    const withoutBlocks = protectedMarkdown.markdown.replace(
        VARIANT_BLOCK_REGEX,
        (_match, attributes: string, body: string) => {
            hasVariantBlocks = true;
            if (variantId != null && parseVariantNames(attributes).includes(variantId)) {
                return body;
            }
            return "";
        }
    );
    let result = restoreCode(withoutBlocks, protectedMarkdown.code);

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
