/**
 * Common initialisms that should be fully capitalized in Go identifiers.
 * Ref: https://github.com/golang/lint/blob/6edffad5e6160f5949cdefc81710b2706fbcd4f6/lint.go#L767
 */
const COMMON_INITIALISMS = new Set([
    "ACL",
    "API",
    "ASCII",
    "CPU",
    "CSS",
    "DNS",
    "EOF",
    "GUID",
    "HTML",
    "HTTP",
    "HTTPS",
    "ID",
    "IP",
    "JSON",
    "LHS",
    "QPS",
    "RAM",
    "RHS",
    "RPC",
    "SAML",
    "SCIM",
    "SLA",
    "SMTP",
    "SQL",
    "SSH",
    "SSO",
    "TCP",
    "TLS",
    "TTL",
    "UDP",
    "UI",
    "UID",
    "UUID",
    "URI",
    "URL",
    "UTF8",
    "VM",
    "XML",
    "XMPP",
    "XSRF",
    "XSS"
]);

const PLURAL_COMMON_INITIALISMS = new Map<string, string>([
    ["ACLS", "ACLs"],
    ["APIS", "APIs"],
    ["CPUS", "CPUs"],
    ["GUIDS", "GUIDs"],
    ["IDS", "IDs"],
    ["UIDS", "UIDs"],
    ["UUIDS", "UUIDs"],
    ["URIS", "URIs"],
    ["URLS", "URLs"]
]);

function isCommonInitialism(word: string): boolean {
    return COMMON_INITIALISMS.has(word.toUpperCase());
}

function maybeGetPluralInitialism(word: string): string | undefined {
    return PLURAL_COMMON_INITIALISMS.get(word.toUpperCase());
}

/**
 * Splits a camelCase string into words. Equivalent to lodash's words() on camelCase input.
 * E.g. "profileImageUrl" -> ["profile", "Image", "Url"]
 *      "xApiVersion" -> ["x", "Api", "Version"]
 */
function splitCamelWords(s: string): string[] {
    const result: string[] = [];
    let current = "";
    for (let i = 0; i < s.length; i++) {
        const ch = s[i]!;
        if (ch >= "A" && ch <= "Z") {
            if (current.length > 0) {
                result.push(current);
            }
            current = ch;
        } else {
            current += ch;
        }
    }
    if (current.length > 0) {
        result.push(current);
    }
    return result;
}

function hasAdjacentCommonInitialisms(wordList: string[]): boolean {
    for (let i = 1; i < wordList.length; i++) {
        const prev = wordList[i - 1]!;
        const curr = wordList[i]!;
        const prevIsInit = isCommonInitialism(prev) || maybeGetPluralInitialism(prev) != null;
        const currIsInit = isCommonInitialism(curr) || maybeGetPluralInitialism(curr) != null;
        if (prevIsInit && currIsInit) {
            return true;
        }
    }
    return false;
}

function upperFirst(s: string): string {
    if (s.length === 0) {
        return s;
    }
    return s[0]!.toUpperCase() + s.slice(1);
}

/**
 * Applies Go initialism casing to a PascalCase name, matching the behavior of
 * CasingsGenerator.computeName with generationLanguage="go" and smartCasing=true.
 *
 * Examples:
 *   "ProfileImageUrl" -> "ProfileImageURL"
 *   "AppId" -> "AppID"
 *   "XApiVersion" -> "XAPIVersion"
 *   "ClientId" -> "ClientID"
 *   "Api" -> "API"
 */
export function applyGoInitialisms(pascalName: string): string {
    if (pascalName.length === 0) {
        return pascalName;
    }
    // Convert to camelCase first, then split into words (matching CasingsGenerator behavior)
    const camelName = pascalName[0]!.toLowerCase() + pascalName.slice(1);
    const camelWords = splitCamelWords(camelName);
    if (camelWords.length === 0) {
        return pascalName;
    }
    if (hasAdjacentCommonInitialisms(camelWords)) {
        return pascalName;
    }
    return upperFirst(
        camelWords
            .map((word, index) => {
                const pluralInitialism = maybeGetPluralInitialism(word);
                if (pluralInitialism != null) {
                    return pluralInitialism;
                }
                if (isCommonInitialism(word)) {
                    return word.toUpperCase();
                }
                if (index === 0) {
                    return upperFirst(word);
                }
                return word;
            })
            .join("")
    );
}

/**
 * Go keywords and predeclared types that should be avoided as struct field names.
 * We check case-insensitively since PascalCase versions like "String" should also be prefixed.
 * We will just add to this list as needed
 */
const GO_RESERVED_IDENTIFIERS = new Set(["string"]);

/**
 * Converts a name to a valid Go exported identifier.
 * Go exported identifiers must start with an uppercase letter.
 * This function handles edge cases like:
 * - Names that are empty or only underscores (e.g., "_") -> "Underscore"
 * - Names that start with a digit (e.g., "1") -> "Field1"
 * - Names that start with underscore followed by digit (e.g., "_1") -> "Field1"
 * - Names that match Go reserved words/predeclared identifiers (e.g., "String") -> "FieldString"
 */
export function goExportedFieldName(name: string): string {
    if (name === "") {
        return "Underscore";
    }

    // Strip leading underscores
    let stripped = name;
    while (stripped.startsWith("_")) {
        stripped = stripped.slice(1);
    }
    if (stripped === "") {
        // Name was all underscores
        return "Underscore";
    }

    // Check if the first character is a digit
    if (stripped.length > 0 && /^\d/.test(stripped)) {
        return "Field" + stripped;
    }

    // Ensure the first letter is uppercase for export
    let result = stripped;
    const firstChar = stripped[0];
    if (stripped.length > 0 && firstChar != null && firstChar !== firstChar.toUpperCase()) {
        result = firstChar.toUpperCase() + stripped.slice(1);
    }

    // Check if the name matches a Go reserved word or predeclared identifier (case-insensitive)
    if (GO_RESERVED_IDENTIFIERS.has(result.toLowerCase())) {
        return "Field" + result;
    }

    return result;
}
