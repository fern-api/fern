package nameutils

import (
	"regexp"
	"strings"
	"unicode"
)

// SafeAndUnsafeString represents a name with safe and unsafe variants
type SafeAndUnsafeString struct {
	UnsafeName string
	SafeName   string
}

// CasedName represents a name with various case conversions
type CasedName struct {
	OriginalName       string
	CamelCase          *SafeAndUnsafeString
	PascalCase         *SafeAndUnsafeString
	SnakeCase          *SafeAndUnsafeString
	ScreamingSnakeCase *SafeAndUnsafeString
}

// ExpandedName represents a fully expanded name with all case variations
type ExpandedName struct {
	OriginalName       string
	CamelCase          SafeAndUnsafeString
	PascalCase         SafeAndUnsafeString
	SnakeCase          SafeAndUnsafeString
	ScreamingSnakeCase SafeAndUnsafeString
}

// NameAndWireValue represents a name with its wire value
type NameAndWireValue struct {
	WireValue string
	Name      interface{} // Either string or *CasedName
}

// ExpandedNameAndWireValue represents an expanded name with its wire value
type ExpandedNameAndWireValue struct {
	WireValue string
	Name      ExpandedName
}

// Lodash-inspired utility functions

// CamelCase converts string to camelCase
func CamelCase(text string) string {
	if text == "" {
		return ""
	}
	
	// Handle camelCase and PascalCase inputs
	// Insert spaces before uppercase letters that follow lowercase letters
	re1 := regexp.MustCompile(`([a-z])([A-Z])`)
	textWithSpaces := re1.ReplaceAllString(text, `${1} ${2}`)
	// Also handle acronyms
	re2 := regexp.MustCompile(`([A-Z]+)([A-Z][a-z])`)
	textWithSpaces = re2.ReplaceAllString(textWithSpaces, `${1} ${2}`)
	
	// Split on non-alphanumeric characters
	re := regexp.MustCompile(`[^a-zA-Z0-9]+`)
	words := re.Split(textWithSpaces, -1)
	
	result := ""
	first := true
	for _, word := range words {
		if word != "" {
			if first {
				result += strings.ToLower(word)
				first = false
			} else {
				result += capitalize(word)
			}
		}
	}
	
	return result
}

// SnakeCase converts string to snake_case
func SnakeCase(text string) string {
	if text == "" {
		return ""
	}
	
	// First, handle transitions from lowercase to uppercase
	re1 := regexp.MustCompile(`(.)([A-Z][a-z]+)`)
	s1 := re1.ReplaceAllString(text, `${1}_${2}`)
	
	// Handle transitions from letter/number to uppercase letter
	re2 := regexp.MustCompile(`([a-z0-9])([A-Z])`)
	s2 := re2.ReplaceAllString(s1, `${1}_${2}`)
	
	// Replace non-alphanumeric with underscores
	re3 := regexp.MustCompile(`[^a-zA-Z0-9]+`)
	s3 := re3.ReplaceAllString(s2, "_")
	
	// Remove leading/trailing underscores and collapse multiple underscores
	re4 := regexp.MustCompile(`_+`)
	s4 := re4.ReplaceAllString(s3, "_")
	s4 = strings.Trim(s4, "_")
	
	return strings.ToLower(s4)
}

// UpperFirst capitalizes the first character of a string
func UpperFirst(text string) string {
	if text == "" {
		return ""
	}
	
	runes := []rune(text)
	runes[0] = unicode.ToUpper(runes[0])
	return string(runes)
}

// capitalize capitalizes the first letter and lowercases the rest
func capitalize(text string) string {
	if text == "" {
		return ""
	}
	
	runes := []rune(text)
	result := []rune{unicode.ToUpper(runes[0])}
	for i := 1; i < len(runes); i++ {
		result = append(result, unicode.ToLower(runes[i]))
	}
	return string(result)
}

// Main API functions

// ExpandNameAndWireValue expands a NameAndWireValue into an ExpandedNameAndWireValue
func ExpandNameAndWireValue(nameAndWireValue NameAndWireValue) ExpandedNameAndWireValue {
	return ExpandedNameAndWireValue{
		WireValue: nameAndWireValue.WireValue,
		Name:      ExpandName(nameAndWireValue.Name),
	}
}

// ExpandName expands a name into an ExpandedName with all case variations
func ExpandName(name interface{}) ExpandedName {
	originalName := GetOriginalName(name)
	camelCaseName := CamelCase(originalName)
	pascalCaseName := UpperFirst(camelCaseName)
	snakeCaseName := SnakeCase(originalName)
	screamingSnakeCaseName := strings.ToUpper(snakeCaseName)
	
	if casedName, ok := name.(*CasedName); ok {
		expandedName := ExpandedName{
			OriginalName: originalName,
		}
		
		if casedName.CamelCase != nil {
			expandedName.CamelCase = *casedName.CamelCase
		} else {
			expandedName.CamelCase = SafeAndUnsafeString{
				UnsafeName: camelCaseName,
				SafeName:   camelCaseName,
			}
		}
		
		if casedName.PascalCase != nil {
			expandedName.PascalCase = *casedName.PascalCase
		} else {
			expandedName.PascalCase = SafeAndUnsafeString{
				UnsafeName: pascalCaseName,
				SafeName:   pascalCaseName,
			}
		}
		
		if casedName.SnakeCase != nil {
			expandedName.SnakeCase = *casedName.SnakeCase
		} else {
			expandedName.SnakeCase = SafeAndUnsafeString{
				UnsafeName: snakeCaseName,
				SafeName:   snakeCaseName,
			}
		}
		
		if casedName.ScreamingSnakeCase != nil {
			expandedName.ScreamingSnakeCase = *casedName.ScreamingSnakeCase
		} else {
			expandedName.ScreamingSnakeCase = SafeAndUnsafeString{
				UnsafeName: screamingSnakeCaseName,
				SafeName:   screamingSnakeCaseName,
			}
		}
		
		return expandedName
	}
	
	return ExpandedName{
		OriginalName: originalName,
		CamelCase: SafeAndUnsafeString{
			UnsafeName: camelCaseName,
			SafeName:   camelCaseName,
		},
		PascalCase: SafeAndUnsafeString{
			UnsafeName: pascalCaseName,
			SafeName:   pascalCaseName,
		},
		SnakeCase: SafeAndUnsafeString{
			UnsafeName: snakeCaseName,
			SafeName:   snakeCaseName,
		},
		ScreamingSnakeCase: SafeAndUnsafeString{
			UnsafeName: screamingSnakeCaseName,
			SafeName:   screamingSnakeCaseName,
		},
	}
}

// GetOriginalName gets the original name from a name object
func GetOriginalName(name interface{}) string {
	switch n := name.(type) {
	case string:
		return n
	case *CasedName:
		return n.OriginalName
	default:
		panic("Name must be either string or *CasedName")
	}
}