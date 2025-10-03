package com.fern.java;

import java.util.Optional;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class NameUtils {
    
    // Data structures
    public static class SafeAndUnsafeString {
        private final String unsafeName;
        private final String safeName;
        
        public SafeAndUnsafeString(String unsafeName, String safeName) {
            this.unsafeName = unsafeName;
            this.safeName = safeName;
        }
        
        public String getUnsafeName() { return unsafeName; }
        public String getSafeName() { return safeName; }
    }
    
    public static class CasedName {
        private final String originalName;
        private final Optional<SafeAndUnsafeString> camelCase;
        private final Optional<SafeAndUnsafeString> pascalCase;
        private final Optional<SafeAndUnsafeString> snakeCase;
        private final Optional<SafeAndUnsafeString> screamingSnakeCase;
        
        public CasedName(String originalName) {
            this(originalName, Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty());
        }
        
        public CasedName(
                String originalName,
                Optional<SafeAndUnsafeString> camelCase,
                Optional<SafeAndUnsafeString> pascalCase,
                Optional<SafeAndUnsafeString> snakeCase,
                Optional<SafeAndUnsafeString> screamingSnakeCase) {
            this.originalName = originalName;
            this.camelCase = camelCase;
            this.pascalCase = pascalCase;
            this.snakeCase = snakeCase;
            this.screamingSnakeCase = screamingSnakeCase;
        }
        
        public String getOriginalName() { return originalName; }
        public Optional<SafeAndUnsafeString> getCamelCase() { return camelCase; }
        public Optional<SafeAndUnsafeString> getPascalCase() { return pascalCase; }
        public Optional<SafeAndUnsafeString> getSnakeCase() { return snakeCase; }
        public Optional<SafeAndUnsafeString> getScreamingSnakeCase() { return screamingSnakeCase; }
    }
    
    public static class ExpandedName {
        private final String originalName;
        private final SafeAndUnsafeString camelCase;
        private final SafeAndUnsafeString pascalCase;
        private final SafeAndUnsafeString snakeCase;
        private final SafeAndUnsafeString screamingSnakeCase;
        
        public ExpandedName(
                String originalName,
                SafeAndUnsafeString camelCase,
                SafeAndUnsafeString pascalCase,
                SafeAndUnsafeString snakeCase,
                SafeAndUnsafeString screamingSnakeCase) {
            this.originalName = originalName;
            this.camelCase = camelCase;
            this.pascalCase = pascalCase;
            this.snakeCase = snakeCase;
            this.screamingSnakeCase = screamingSnakeCase;
        }
        
        public String getOriginalName() { return originalName; }
        public SafeAndUnsafeString getCamelCase() { return camelCase; }
        public SafeAndUnsafeString getPascalCase() { return pascalCase; }
        public SafeAndUnsafeString getSnakeCase() { return snakeCase; }
        public SafeAndUnsafeString getScreamingSnakeCase() { return screamingSnakeCase; }
    }
    
    public static class NameAndWireValue {
        private final String wireValue;
        private final Object name; // Either String or CasedName
        
        public NameAndWireValue(String wireValue, String name) {
            this.wireValue = wireValue;
            this.name = name;
        }
        
        public NameAndWireValue(String wireValue, CasedName name) {
            this.wireValue = wireValue;
            this.name = name;
        }
        
        public String getWireValue() { return wireValue; }
        public Object getName() { return name; }
    }
    
    public static class ExpandedNameAndWireValue {
        private final String wireValue;
        private final ExpandedName name;
        
        public ExpandedNameAndWireValue(String wireValue, ExpandedName name) {
            this.wireValue = wireValue;
            this.name = name;
        }
        
        public String getWireValue() { return wireValue; }
        public ExpandedName getName() { return name; }
    }
    
    // Lodash-inspired utility functions
    public static String camelCase(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        
        // Handle camelCase and PascalCase inputs
        // Insert spaces before uppercase letters that follow lowercase letters
        String textWithSpaces = text.replaceAll("([a-z])([A-Z])", "$1 $2");
        // Also handle acronyms
        textWithSpaces = textWithSpaces.replaceAll("([A-Z]+)([A-Z][a-z])", "$1 $2");
        
        // Split on non-alphanumeric characters
        String[] words = textWithSpaces.split("[^a-zA-Z0-9]+");
        StringBuilder result = new StringBuilder();
        
        boolean first = true;
        for (String word : words) {
            if (!word.isEmpty()) {
                if (first) {
                    result.append(word.toLowerCase());
                    first = false;
                } else {
                    result.append(capitalize(word));
                }
            }
        }
        
        return result.toString();
    }
    
    public static String snakeCase(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        
        // First, handle transitions from lowercase to uppercase
        String s1 = text.replaceAll("(.)([A-Z][a-z]+)", "$1_$2");
        // Handle transitions from letter/number to uppercase letter
        String s2 = s1.replaceAll("([a-z0-9])([A-Z])", "$1_$2");
        // Replace non-alphanumeric with underscores
        String s3 = s2.replaceAll("[^a-zA-Z0-9]+", "_");
        // Remove leading/trailing underscores and collapse multiple underscores
        String s4 = s3.replaceAll("_+", "_");
        s4 = s4.replaceAll("^_|_$", "");
        
        return s4.toLowerCase();
    }
    
    public static String upperFirst(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }
    
    private static String capitalize(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        return Character.toUpperCase(text.charAt(0)) + text.substring(1).toLowerCase();
    }
    
    // Main API functions
    public static ExpandedNameAndWireValue expandNameAndWireValue(NameAndWireValue nameAndWireValue) {
        return new ExpandedNameAndWireValue(
            nameAndWireValue.getWireValue(),
            expandName(nameAndWireValue.getName())
        );
    }
    
    public static ExpandedName expandName(Object name) {
        String originalName = getOriginalName(name);
        String camelCaseName = camelCase(originalName);
        String pascalCaseName = upperFirst(camelCaseName);
        String snakeCaseName = snakeCase(originalName);
        String screamingSnakeCaseName = snakeCaseName.toUpperCase();
        
        if (name instanceof CasedName) {
            CasedName casedName = (CasedName) name;
            return new ExpandedName(
                originalName,
                casedName.getCamelCase().orElse(
                    new SafeAndUnsafeString(camelCaseName, camelCaseName)
                ),
                casedName.getPascalCase().orElse(
                    new SafeAndUnsafeString(pascalCaseName, pascalCaseName)
                ),
                casedName.getSnakeCase().orElse(
                    new SafeAndUnsafeString(snakeCaseName, snakeCaseName)
                ),
                casedName.getScreamingSnakeCase().orElse(
                    new SafeAndUnsafeString(screamingSnakeCaseName, screamingSnakeCaseName)
                )
            );
        }
        
        return new ExpandedName(
            originalName,
            new SafeAndUnsafeString(camelCaseName, camelCaseName),
            new SafeAndUnsafeString(pascalCaseName, pascalCaseName),
            new SafeAndUnsafeString(snakeCaseName, snakeCaseName),
            new SafeAndUnsafeString(screamingSnakeCaseName, screamingSnakeCaseName)
        );
    }
    
    public static String getOriginalName(Object name) {
        if (name instanceof String) {
            return (String) name;
        } else if (name instanceof CasedName) {
            return ((CasedName) name).getOriginalName();
        }
        throw new IllegalArgumentException("Name must be either String or CasedName");
    }
}