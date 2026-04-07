package common

import (
	"strings"
	"sync"
	"unicode"
)

// casingConfig holds the IR's casingsConfig values, used by nameFromString
// to match the TypeScript CasingsGenerator's computeName behavior.
type casingConfig struct {
	smartCasing        bool
	generationLanguage string
	// keywords from the IR's casingsConfig. When non-nil, these override the
	// default reserved keywords for the generation language.
	keywords map[string]bool
}

var (
	// casingCfg defaults to smartCasing=true, matching the latest CLI behavior.
	// ConfigureCasing overrides this with the IR's actual casingsConfig values.
	casingCfg     = casingConfig{smartCasing: true}
	casingCfgOnce sync.Once
	// casingCfgSet tracks whether ConfigureCasing has been called.
	casingCfgSet bool
)

// capitalizeInitialismLanguages mirrors the TypeScript CAPITALIZE_INITIALISM list.
var capitalizeInitialismLanguages = map[string]bool{
	"go":   true,
	"ruby": true,
}

// ConfigureCasing sets the casing configuration extracted from the IR's casingsConfig.
// Must be called before json.Unmarshal of the IR (i.e. before Name.UnmarshalJSON runs).
// Safe to call multiple times; only the first call takes effect.
//
// The keywords parameter mirrors the TypeScript CaseConverter constructor:
//   - If keywords is non-nil, those exact keywords are used for sanitization.
//   - If keywords is nil, the default reserved keywords for the generation
//     language are used (matching getKeywords() in CasingsGenerator.ts).
func ConfigureCasing(smartCasing bool, generationLanguage string, keywords []string) {
	casingCfgOnce.Do(func() {
		var kwSet map[string]bool
		if keywords != nil {
			kwSet = make(map[string]bool, len(keywords))
			for _, kw := range keywords {
				kwSet[kw] = true
			}
		}
		casingCfg = casingConfig{
			smartCasing:        smartCasing,
			generationLanguage: generationLanguage,
			keywords:           kwSet,
		}
		casingCfgSet = true
	})
}

// resetCasingConfig resets the casing configuration for testing.
func resetCasingConfig() {
	casingCfg = casingConfig{smartCasing: true}
	casingCfgOnce = sync.Once{}
	casingCfgSet = false
}

// commonInitialisms is the set of common initialisms that should be fully
// capitalized when used in Go identifiers (e.g. HTTP, JSON, API).
//
// Ref: https://github.com/golang/lint/blob/6edffad5e6160f5949cdefc81710b2706fbcd4f6/lint.go#L767C1-L809C2
var commonInitialisms = map[string]bool{
	"ACL":   true,
	"API":   true,
	"ASCII": true,
	"CPU":   true,
	"CSS":   true,
	"DNS":   true,
	"EOF":   true,
	"GUID":  true,
	"HTML":  true,
	"HTTP":  true,
	"HTTPS": true,
	"ID":    true,
	"IP":    true,
	"JSON":  true,
	"LHS":   true,
	"QPS":   true,
	"RAM":   true,
	"RHS":   true,
	"RPC":   true,
	"SAML":  true,
	"SCIM":  true,
	"SLA":   true,
	"SMTP":  true,
	"SQL":   true,
	"SSH":   true,
	"SSO":   true,
	"TCP":   true,
	"TLS":   true,
	"TTL":   true,
	"UDP":   true,
	"UI":    true,
	"UID":   true,
	"UUID":  true,
	"URI":   true,
	"URL":   true,
	"UTF8":  true,
	"VM":    true,
	"XML":   true,
	"XMPP":  true,
	"XSRF":  true,
	"XSS":   true,
}

// pluralCommonInitialisms maps uppercase plural forms of common initialisms
// to their correct display form (e.g. APIS -> APIs).
var pluralCommonInitialisms = map[string]string{
	"ACLS":  "ACLs",
	"APIS":  "APIs",
	"CPUS":  "CPUs",
	"GUIDS": "GUIDs",
	"IDS":   "IDs",
	"UIDS":  "UIDs",
	"UUIDS": "UUIDs",
	"URIS":  "URIs",
	"URLS":  "URLs",
}

// goReservedKeywords is the set of Go reserved keywords and predeclared identifiers.
var goReservedKeywords = map[string]bool{
	// Keywords
	"break": true, "case": true, "chan": true, "const": true, "continue": true,
	"default": true, "defer": true, "else": true, "fallthrough": true, "for": true,
	"func": true, "go": true, "goto": true, "if": true, "import": true,
	"interface": true, "internal": true, "map": true, "package": true, "range": true,
	"return": true, "select": true, "struct": true, "switch": true, "type": true,
	"var": true, "vendor": true,
	// Predeclared identifiers (technically allowed but should be avoided)
	"any": true, "bool": true, "byte": true, "complex64": true, "complex128": true,
	"error": true, "float32": true, "float64": true, "int": true, "int8": true,
	"int16": true, "int32": true, "int64": true, "make": true, "new": true,
	"rune": true, "string": true, "uint": true, "uint8": true, "uint16": true,
	"uint32": true, "uint64": true, "uintptr": true,
}

// nameFromString computes a full Name from a plain string, replicating the
// TypeScript CasingsGenerator's computeName logic. Behavior depends on the
// IR's casingsConfig (set via ConfigureCasing):
//   - smartCasing=false: standard lodash-style casing, no initialisms
//   - smartCasing=true + language in CAPITALIZE_INITIALISM: apply Go/Ruby initialisms
func nameFromString(input string) *Name {
	preprocessed := preprocessName(input)

	camel := toCamelCase(preprocessed)
	pascal := toPascalCase(preprocessed)

	var snake string
	if casingCfg.smartCasing {
		snake = toSmartSnakeCase(preprocessed)
	} else {
		snake = toBasicSnakeCase(preprocessed)
	}
	screaming := strings.ToUpper(snake)

	// Apply initialism casing only when smartCasing is enabled and
	// the generation language is in the CAPITALIZE_INITIALISM list.
	if casingCfg.smartCasing &&
		(casingCfg.generationLanguage == "" || capitalizeInitialismLanguages[casingCfg.generationLanguage]) {
		camelWords := splitWords(camel)
		if !hasAdjacentCommonInitialisms(camelWords) {
			camel = applyInitialismsCamel(camelWords)
			pascal = applyInitialismsPascal(camelWords)
		}
	}

	return &Name{
		OriginalName:       input,
		CamelCase:          makeSafeAndUnsafe(camel),
		PascalCase:         makeSafeAndUnsafe(pascal),
		SnakeCase:          makeSafeAndUnsafe(snake),
		ScreamingSnakeCase: makeSafeAndUnsafe(screaming),
	}
}

// nameAndWireValueFromString computes a full NameAndWireValue from a plain
// string, where the string serves as both the wireValue and the name.
func nameAndWireValueFromString(input string) *NameAndWireValue {
	return &NameAndWireValue{
		WireValue: input,
		Name:      nameFromString(input),
	}
}

func makeSafeAndUnsafe(unsafeName string) *SafeAndUnsafeString {
	return &SafeAndUnsafeString{
		UnsafeName: unsafeName,
		SafeName:   sanitizeName(unsafeName),
	}
}

// sanitizeName escapes names that conflict with reserved keywords, matching
// the TypeScript CasingsGenerator's sanitizeName + getKeywords logic:
//   - If IR provided explicit keywords, use those.
//   - Otherwise fall back to the default reserved keywords for the generation language.
//   - If neither keywords nor language are set, no keyword escaping is applied.
func sanitizeName(name string) string {
	keywords := getEffectiveKeywords()
	if keywords != nil && keywords[name] {
		return name + "_"
	}
	if len(name) > 0 && name[0] >= '0' && name[0] <= '9' {
		return "_" + name
	}
	return name
}

// getEffectiveKeywords returns the keyword set to use for sanitization,
// mirroring the TypeScript getKeywords() function in CasingsGenerator.ts:
//   - If IR provided explicit keywords, use those.
//   - Else if generationLanguage is set, use default keywords for that language.
//   - Else return nil (no sanitization).
func getEffectiveKeywords() map[string]bool {
	if casingCfg.keywords != nil {
		return casingCfg.keywords
	}
	if casingCfg.generationLanguage != "" {
		return defaultKeywordsForLanguage(casingCfg.generationLanguage)
	}
	return nil
}

// defaultKeywordsForLanguage returns the default reserved keywords for a given
// generation language, mirroring RESERVED_KEYWORDS in reserved.ts.
func defaultKeywordsForLanguage(lang string) map[string]bool {
	switch lang {
	case "go":
		return goReservedKeywords
	default:
		// For non-Go languages, no default keywords are defined in the Go v1
		// binary. The Go v1 generator only runs for Go, so this is safe.
		return nil
	}
}

// preprocessName applies preprocessing replacements to names before casing transformations.
func preprocessName(name string) string {
	return strings.ReplaceAll(name, "[]", "Array")
}

// splitWords splits a camelCase/PascalCase string into its component words.
// This is equivalent to lodash's words() function on camelCase input.
func splitWords(s string) []string {
	var words []string
	var current []rune
	runes := []rune(s)
	for i := 0; i < len(runes); i++ {
		r := runes[i]
		if unicode.IsUpper(r) {
			// Check if this is the start of a new word
			if len(current) > 0 {
				// Look ahead: if next char is lowercase, this uppercase starts a new word
				// But if current is all uppercase and next is uppercase too, continue the run
				if i+1 < len(runes) && unicode.IsLower(runes[i+1]) {
					// If previous chars were uppercase run (like "HTTP"), flush entire run
					if unicode.IsUpper(current[len(current)-1]) && len(current) > 1 {
						words = append(words, string(current))
						current = current[:0]
					} else if unicode.IsUpper(current[len(current)-1]) {
						// Single uppercase char before this - keep it as part of current
					} else {
						words = append(words, string(current))
						current = current[:0]
					}
				} else if !unicode.IsUpper(current[len(current)-1]) {
					words = append(words, string(current))
					current = current[:0]
				}
			}
			current = append(current, r)
		} else if unicode.IsDigit(r) {
			if len(current) > 0 && !unicode.IsDigit(current[len(current)-1]) {
				words = append(words, string(current))
				current = current[:0]
			}
			current = append(current, r)
		} else if unicode.IsLetter(r) {
			if len(current) > 0 && unicode.IsDigit(current[len(current)-1]) {
				words = append(words, string(current))
				current = current[:0]
			}
			current = append(current, r)
		} else {
			// separator character
			if len(current) > 0 {
				words = append(words, string(current))
				current = current[:0]
			}
		}
	}
	if len(current) > 0 {
		words = append(words, string(current))
	}
	return words
}

// toCamelCase converts a string to camelCase (like lodash's camelCase).
func toCamelCase(s string) string {
	words := splitWords(s)
	if len(words) == 0 {
		return ""
	}
	var result strings.Builder
	for i, word := range words {
		if i == 0 {
			result.WriteString(strings.ToLower(word))
		} else {
			result.WriteString(upperFirst(strings.ToLower(word)))
		}
	}
	return result.String()
}

// toPascalCase converts a string to PascalCase.
func toPascalCase(s string) string {
	words := splitWords(s)
	if len(words) == 0 {
		return ""
	}
	var result strings.Builder
	for _, word := range words {
		result.WriteString(upperFirst(strings.ToLower(word)))
	}
	return result.String()
}

// toSmartSnakeCase converts a string to snake_case with smart number handling.
// In smartCasing mode, "v2" stays "v2" instead of "v_2".
func toSmartSnakeCase(s string) string {
	// Split on spaces first (to handle "test2This2 2v22" => "test2this2_2v22")
	spaceParts := strings.Split(s, " ")
	var snakeParts []string
	for _, part := range spaceParts {
		// Split on digits, then snake_case each non-digit segment
		segments := splitByDigits(part)
		var partResult strings.Builder
		for _, seg := range segments {
			if len(seg) > 0 && seg[0] >= '0' && seg[0] <= '9' {
				partResult.WriteString(seg)
			} else {
				partResult.WriteString(toBasicSnakeCase(seg))
			}
		}
		snakeParts = append(snakeParts, partResult.String())
	}
	return strings.Join(snakeParts, "_")
}

// splitByDigits splits a string into alternating non-digit and digit segments.
func splitByDigits(s string) []string {
	var segments []string
	var current strings.Builder
	inDigits := false
	for _, r := range s {
		isDigit := r >= '0' && r <= '9'
		if current.Len() > 0 && isDigit != inDigits {
			segments = append(segments, current.String())
			current.Reset()
		}
		inDigits = isDigit
		current.WriteRune(r)
	}
	if current.Len() > 0 {
		segments = append(segments, current.String())
	}
	return segments
}

// toBasicSnakeCase converts a string to snake_case (like lodash's snakeCase).
func toBasicSnakeCase(s string) string {
	words := splitWords(s)
	if len(words) == 0 {
		return ""
	}
	lowered := make([]string, len(words))
	for i, w := range words {
		lowered[i] = strings.ToLower(w)
	}
	return strings.Join(lowered, "_")
}

func upperFirst(s string) string {
	if len(s) == 0 {
		return s
	}
	runes := []rune(s)
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}

func isCommonInitialism(word string) bool {
	return commonInitialisms[strings.ToUpper(word)]
}

func maybeGetPluralInitialism(word string) string {
	if v, ok := pluralCommonInitialisms[strings.ToUpper(word)]; ok {
		return v
	}
	return ""
}

func hasAdjacentCommonInitialisms(wordList []string) bool {
	for i := 1; i < len(wordList); i++ {
		prev := wordList[i-1]
		curr := wordList[i]
		prevIsInit := isCommonInitialism(prev) || maybeGetPluralInitialism(prev) != ""
		currIsInit := isCommonInitialism(curr) || maybeGetPluralInitialism(curr) != ""
		if prevIsInit && currIsInit {
			return true
		}
	}
	return false
}

// applyInitialismsCamel applies smart initialism casing to a camelCase word list.
// The first word stays lowercase; subsequent words that are initialisms get uppercased.
func applyInitialismsCamel(camelWords []string) string {
	var result strings.Builder
	for i, word := range camelWords {
		if i > 0 {
			if plural := maybeGetPluralInitialism(word); plural != "" {
				result.WriteString(plural)
				continue
			}
			if isCommonInitialism(word) {
				result.WriteString(strings.ToUpper(word))
				continue
			}
		}
		result.WriteString(word)
	}
	return result.String()
}

// applyInitialismsPascal applies smart initialism casing to a PascalCase word list.
// All words that are initialisms get uppercased, including the first.
func applyInitialismsPascal(camelWords []string) string {
	var result strings.Builder
	for i, word := range camelWords {
		if plural := maybeGetPluralInitialism(word); plural != "" {
			result.WriteString(plural)
			continue
		}
		if isCommonInitialism(word) {
			result.WriteString(strings.ToUpper(word))
			continue
		}
		if i == 0 {
			result.WriteString(upperFirst(word))
		} else {
			result.WriteString(word)
		}
	}
	return result.String()
}
