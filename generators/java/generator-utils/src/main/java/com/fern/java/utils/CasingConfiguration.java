package com.fern.java.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Replicates the TypeScript CasingsGenerator's computeName logic in Java, handling: - camelCase, PascalCase,
 * snake_case, SCREAMING_SNAKE_CASE conversions - smartCasing (smart snake_case that keeps numbers adjacent to letters:
 * "v2" stays "v2") - initialism capitalization for Go/Ruby (not Java) - keyword sanitization
 *
 * <p>This is used by the custom Jackson deserializers to inflate compressed string names in v66 IR back into full Name
 * objects that the v65 IR SDK expects.
 */
public final class CasingConfiguration {

    private static final Set<String> COMMON_INITIALISMS = Set.of(
            "ACL", "API", "ASCII", "CPU", "CSS", "DNS", "EOF", "GUID", "HTML", "HTTP", "HTTPS", "ID", "IP", "JSON",
            "LHS", "QPS", "RAM", "RHS", "RPC", "SAML", "SCIM", "SLA", "SMTP", "SQL", "SSH", "SSO", "TCP", "TLS", "TTL",
            "UDP", "UI", "UID", "UUID", "URI", "URL", "UTF8", "VM", "XML", "XMPP", "XSRF", "XSS");

    private static final java.util.Map<String, String> PLURAL_COMMON_INITIALISMS = java.util.Map.of(
            "ACLS", "ACLs", "APIS", "APIs", "CPUS", "CPUs", "GUIDS", "GUIDs", "IDS", "IDs", "UIDS", "UIDs", "UUIDS",
            "UUIDs", "URIS", "URIs", "URLS", "URLs");

    private static final Set<String> CAPITALIZE_INITIALISM_LANGUAGES = Set.of("go", "ruby");

    private static final Pattern STARTS_WITH_NUMBER = Pattern.compile("^[0-9]");

    // Match lodash words() regex: [A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+
    private static final Pattern SPLIT_WORDS_PATTERN =
            Pattern.compile("[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+");

    // Java reserved keywords for keyword sanitization
    private static final Set<String> JAVA_RESERVED_KEYWORDS = Set.of(
            "abstract",
            "assert",
            "boolean",
            "break",
            "byte",
            "case",
            "catch",
            "char",
            "class",
            "const",
            "continue",
            "default",
            "do",
            "double",
            "else",
            "enum",
            "extends",
            "final",
            "finally",
            "float",
            "for",
            "goto",
            "if",
            "implements",
            "import",
            "instanceof",
            "int",
            "interface",
            "long",
            "native",
            "new",
            "package",
            "private",
            "protected",
            "public",
            "return",
            "short",
            "static",
            "strictfp",
            "super",
            "switch",
            "synchronized",
            "this",
            "throw",
            "throws",
            "transient",
            "try",
            "void",
            "volatile",
            "while");

    private final boolean smartCasing;
    private final String generationLanguage;
    private final Set<String> keywords;
    private final Map<String, NameParts> nameCache = new HashMap<>();

    private CasingConfiguration(boolean smartCasing, String generationLanguage, Set<String> keywords) {
        this.smartCasing = smartCasing;
        this.generationLanguage = generationLanguage;
        this.keywords = keywords;
    }

    /**
     * Extracts the casingsConfig from the IR JSON root node and constructs a CasingConfiguration. Mirrors the
     * TypeScript constructFullCasingsGenerator behavior.
     */
    public static CasingConfiguration fromIrJson(JsonNode rootNode) {
        boolean smartCasing = true; // default to true, matching latest CLI behavior
        String generationLanguage = null;
        Set<String> keywords = null;

        JsonNode casingsConfig = rootNode.get("casingsConfig");
        if (casingsConfig != null && !casingsConfig.isNull()) {
            JsonNode smartCasingNode = casingsConfig.get("smartCasing");
            if (smartCasingNode != null && !smartCasingNode.isNull()) {
                smartCasing = smartCasingNode.asBoolean(true);
            }

            JsonNode langNode = casingsConfig.get("generationLanguage");
            if (langNode != null && !langNode.isNull() && langNode.isTextual()) {
                generationLanguage = langNode.asText();
            }

            JsonNode keywordsNode = casingsConfig.get("keywords");
            if (keywordsNode != null && !keywordsNode.isNull() && keywordsNode.isArray()) {
                keywords = new HashSet<>();
                for (JsonNode kw : keywordsNode) {
                    keywords.add(kw.asText());
                }
            }
        }

        return new CasingConfiguration(smartCasing, generationLanguage, keywords);
    }

    /**
     * Computes a full Name JSON-equivalent from a plain string, replicating TypeScript's computeName. Returns a
     * NameParts object with all casing variants.
     */
    public NameParts computeName(String inputName) {
        NameParts cached = nameCache.get(inputName);
        if (cached != null) {
            return cached;
        }
        NameParts result = computeNameInternal(inputName);
        nameCache.put(inputName, result);
        return result;
    }

    private NameParts computeNameInternal(String inputName) {
        String name = preprocessName(inputName);

        String camelCaseName = toCamelCase(name);
        String pascalCaseName = upperFirst(camelCaseName);
        String snakeCaseName;

        if (smartCasing) {
            snakeCaseName = toSmartSnakeCase(name);
        } else {
            snakeCaseName = toBasicSnakeCase(name);
        }
        String screamingSnakeCaseName = snakeCaseName.toUpperCase();

        // Apply initialism casing only when smartCasing is enabled and
        // the generation language is in the CAPITALIZE_INITIALISM list.
        if (smartCasing
                && (generationLanguage == null || CAPITALIZE_INITIALISM_LANGUAGES.contains(generationLanguage))) {
            List<String> camelWords = splitWords(camelCaseName);
            if (!hasAdjacentCommonInitialisms(camelWords)) {
                camelCaseName = applyInitialismsCamel(camelWords);
                pascalCaseName = applyInitialismsPascal(camelWords);
            }
        }

        return new NameParts(
                inputName,
                camelCaseName,
                sanitizeName(camelCaseName),
                pascalCaseName,
                sanitizeName(pascalCaseName),
                snakeCaseName,
                sanitizeName(snakeCaseName),
                screamingSnakeCaseName,
                sanitizeName(screamingSnakeCaseName));
    }

    private String preprocessName(String name) {
        return name.replace("[]", "Array");
    }

    private String sanitizeName(String name) {
        Set<String> effectiveKeywords = getEffectiveKeywords();
        if (effectiveKeywords == null) {
            return name;
        }
        if (effectiveKeywords.contains(name)) {
            return name + "_";
        }
        if (STARTS_WITH_NUMBER.matcher(name).find()) {
            return "_" + name;
        }
        return name;
    }

    private Set<String> getEffectiveKeywords() {
        if (keywords != null) {
            return keywords;
        }
        if (generationLanguage != null) {
            return getDefaultKeywordsForLanguage(generationLanguage);
        }
        return null;
    }

    private static Set<String> getDefaultKeywordsForLanguage(String lang) {
        if ("java".equals(lang)) {
            return JAVA_RESERVED_KEYWORDS;
        }
        // For other languages, no default keywords defined in Java v1.
        // The Java v1 generator only runs for Java.
        return null;
    }

    // ===== Casing conversion methods =====

    /**
     * Splits a string into words, matching lodash's words() behavior. Uses the same regex pattern:
     * [A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+
     *
     * <p>Examples: "AValue" -> ["A", "Value"] "HTTPSClient" -> ["HTTPS", "Client"] "userId" -> ["user", "Id"]
     * "XMLParser" -> ["XML", "Parser"] "ABCDef" -> ["ABC", "Def"] "AB" -> ["AB"]
     */
    static List<String> splitWords(String s) {
        if (s == null || s.isEmpty()) {
            return Collections.emptyList();
        }

        Matcher matcher = SPLIT_WORDS_PATTERN.matcher(s);
        List<String> words = new ArrayList<>();
        while (matcher.find()) {
            words.add(matcher.group());
        }
        return words;
    }

    static String toCamelCase(String s) {
        List<String> words = splitWords(s);
        if (words.isEmpty()) {
            return "";
        }
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < words.size(); i++) {
            if (i == 0) {
                result.append(words.get(i).toLowerCase());
            } else {
                result.append(upperFirst(words.get(i).toLowerCase()));
            }
        }
        return result.toString();
    }

    static String toPascalCase(String s) {
        List<String> words = splitWords(s);
        if (words.isEmpty()) {
            return "";
        }
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            result.append(upperFirst(word.toLowerCase()));
        }
        return result.toString();
    }

    static String toBasicSnakeCase(String s) {
        List<String> words = splitWords(s);
        if (words.isEmpty()) {
            return "";
        }
        List<String> lowered = new ArrayList<>();
        for (String w : words) {
            lowered.add(w.toLowerCase());
        }
        return String.join("_", lowered);
    }

    /**
     * Smart snake_case: keeps numbers adjacent to letters ("v2" stays "v2" instead of "v_2"). Matches TypeScript: split
     * on spaces, then each part split on digits, snake_case each non-digit segment.
     */
    static String toSmartSnakeCase(String s) {
        String[] spaceParts = s.split(" ");
        List<String> snakeParts = new ArrayList<>();
        for (String part : spaceParts) {
            List<String> segments = splitByDigits(part);
            StringBuilder partResult = new StringBuilder();
            for (String seg : segments) {
                if (!seg.isEmpty() && seg.charAt(0) >= '0' && seg.charAt(0) <= '9') {
                    partResult.append(seg);
                } else {
                    partResult.append(toBasicSnakeCase(seg));
                }
            }
            snakeParts.add(partResult.toString());
        }
        return String.join("_", snakeParts);
    }

    static List<String> splitByDigits(String s) {
        List<String> segments = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inDigits = false;
        for (char c : s.toCharArray()) {
            boolean isDigit = c >= '0' && c <= '9';
            if (current.length() > 0 && isDigit != inDigits) {
                segments.add(current.toString());
                current.setLength(0);
            }
            inDigits = isDigit;
            current.append(c);
        }
        if (current.length() > 0) {
            segments.add(current.toString());
        }
        return segments;
    }

    static String upperFirst(String s) {
        if (s == null || s.isEmpty()) {
            return s;
        }
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private static boolean isCommonInitialism(String word) {
        return COMMON_INITIALISMS.contains(word.toUpperCase());
    }

    private static String maybeGetPluralInitialism(String word) {
        return PLURAL_COMMON_INITIALISMS.get(word.toUpperCase());
    }

    private static boolean hasAdjacentCommonInitialisms(List<String> wordList) {
        for (int i = 1; i < wordList.size(); i++) {
            String prev = wordList.get(i - 1);
            String curr = wordList.get(i);
            boolean prevIsInit = isCommonInitialism(prev) || maybeGetPluralInitialism(prev) != null;
            boolean currIsInit = isCommonInitialism(curr) || maybeGetPluralInitialism(curr) != null;
            if (prevIsInit && currIsInit) {
                return true;
            }
        }
        return false;
    }

    private static String applyInitialismsCamel(List<String> camelWords) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < camelWords.size(); i++) {
            String word = camelWords.get(i);
            if (i > 0) {
                String plural = maybeGetPluralInitialism(word);
                if (plural != null) {
                    result.append(plural);
                    continue;
                }
                if (isCommonInitialism(word)) {
                    result.append(word.toUpperCase());
                    continue;
                }
            }
            result.append(word);
        }
        return result.toString();
    }

    private static String applyInitialismsPascal(List<String> camelWords) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < camelWords.size(); i++) {
            String word = camelWords.get(i);
            String plural = maybeGetPluralInitialism(word);
            if (plural != null) {
                result.append(plural);
                continue;
            }
            if (isCommonInitialism(word)) {
                result.append(word.toUpperCase());
                continue;
            }
            if (i == 0) {
                result.append(upperFirst(word));
            } else {
                result.append(word);
            }
        }
        return result.toString();
    }

    /** Builds a Name IR object from a JSON object node (v65 full form). */
    static Name nameFromObjectNode(JsonNode node) {
        return Name.builder()
                .originalName(node.get("originalName").asText())
                .camelCase(safeAndUnsafeFromNode(node.get("camelCase")))
                .pascalCase(safeAndUnsafeFromNode(node.get("pascalCase")))
                .snakeCase(safeAndUnsafeFromNode(node.get("snakeCase")))
                .screamingSnakeCase(safeAndUnsafeFromNode(node.get("screamingSnakeCase")))
                .build();
    }

    static SafeAndUnsafeString safeAndUnsafeFromNode(JsonNode node) {
        return SafeAndUnsafeString.builder()
                .unsafeName(node.get("unsafeName").asText())
                .safeName(node.get("safeName").asText())
                .build();
    }

    /** Holds all casing variants for a name, used to construct the full Name JSON object. */
    public static final class NameParts {
        public final String originalName;
        public final String camelUnsafe;
        public final String camelSafe;
        public final String pascalUnsafe;
        public final String pascalSafe;
        public final String snakeUnsafe;
        public final String snakeSafe;
        public final String screamingSnakeUnsafe;
        public final String screamingSnakeSafe;

        NameParts(
                String originalName,
                String camelUnsafe,
                String camelSafe,
                String pascalUnsafe,
                String pascalSafe,
                String snakeUnsafe,
                String snakeSafe,
                String screamingSnakeUnsafe,
                String screamingSnakeSafe) {
            this.originalName = originalName;
            this.camelUnsafe = camelUnsafe;
            this.camelSafe = camelSafe;
            this.pascalUnsafe = pascalUnsafe;
            this.pascalSafe = pascalSafe;
            this.snakeUnsafe = snakeUnsafe;
            this.snakeSafe = snakeSafe;
            this.screamingSnakeUnsafe = screamingSnakeUnsafe;
            this.screamingSnakeSafe = screamingSnakeSafe;
        }

        /** Converts these casing variants into a Name IR object. */
        public Name toName() {
            return Name.builder()
                    .originalName(originalName)
                    .camelCase(SafeAndUnsafeString.builder()
                            .unsafeName(camelUnsafe)
                            .safeName(camelSafe)
                            .build())
                    .pascalCase(SafeAndUnsafeString.builder()
                            .unsafeName(pascalUnsafe)
                            .safeName(pascalSafe)
                            .build())
                    .snakeCase(SafeAndUnsafeString.builder()
                            .unsafeName(snakeUnsafe)
                            .safeName(snakeSafe)
                            .build())
                    .screamingSnakeCase(SafeAndUnsafeString.builder()
                            .unsafeName(screamingSnakeUnsafe)
                            .safeName(screamingSnakeSafe)
                            .build())
                    .build();
        }
    }
}
