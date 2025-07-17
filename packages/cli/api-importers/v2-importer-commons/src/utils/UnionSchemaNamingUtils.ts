import { OpenAPIV3_1 } from "openapi-types";

export namespace UnionSchemaNamingUtils {
    /**
     * Generates a meaningful display name for inlined union variants using a heuristic:
     * 1. Try description first
     * 2. Try title
     * 3. For object schemas, generate name from distinctive properties
     * 4. Fall back to undefined (will use auto-generated name)
     */
    export function generateDisplayNameForInlinedObject(
        subSchema: OpenAPIV3_1.SchemaObject,
        index: number,
        allVariants: OpenAPIV3_1.SchemaObject[]
    ): string | undefined {
        // Try description first
        if (subSchema.description) {
            const nameFromDescription = cleanDescriptionForDisplayName(subSchema.description);
            if (nameFromDescription) {
                return nameFromDescription;
            }
        }

        // Try title
        if (subSchema.title) {
            return subSchema.title;
        }

        // For object schemas, try to generate name from properties
        if (subSchema.type === "object" && subSchema.properties && Object.keys(subSchema.properties).length > 0) {
            const nameFromProperties = generateNameFromObjectProperties(subSchema, allVariants);
            if (nameFromProperties) {
                return nameFromProperties;
            }
        }

        // Fall back to undefined (will use auto-generated name)
        return undefined;
    }

    /**
     * Cleans up a description string to make it a valid display name
     */
    export function cleanDescriptionForDisplayName(description: string): string | undefined {
        // Take first sentence, clean it up, make it a valid identifier
        const firstSentence = description?.split(".")[0]?.trim();
        if (!firstSentence) {
            return undefined;
        }

        // Comprehensive function words to exclude from naming
        const functionWords = new Set([
            // Articles
            "a", "an", "the",
            // Conjunctions
            "and", "or", "but", "nor", "yet", "so",
            // Prepositions
            "in", "on", "at", "to", "for", "of", "with", "by", "from", "up", "about", 
            "into", "through", "during", "before", "after", "above", "below", "between", 
            "among", "under", "over", "across", "against", "along", "around", "behind",
            "beneath", "beside", "beyond", "down", "inside", "near", "off", "outside",
            "since", "toward", "until", "upon", "within", "without",
            // Auxiliary verbs
            "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
            "do", "does", "did", "will", "would", "could", "should", "may", "might",
            "must", "can", "shall",
            // Pronouns
            "this", "that", "these", "those", "it", "its", "they", "them", "their",
            // Question words
            "when", "where", "why", "how", "what", "which", "who", "whom", "whose",
            // Generic verbs/participles that don't add meaning
            "used", "using", "containing", "including", "having", "showing", "providing",
            "created", "generated", "processed", "stored", "managed", "handled", "returned",
            "sent", "received", "given", "taken", "made", "done", "called", "named",
            // Generic adjectives/adverbs
            "available", "current", "existing", "present", "new", "old", "main", "primary",
            "secondary", "additional", "extra", "special", "specific", "general", "common",
            "basic", "simple", "complex", "full", "empty", "complete", "partial",
            // Other meaningless connectors
            "also", "then", "now", "here", "there", "only", "just", "even", "still",
            "already", "always", "never", "sometimes", "often", "usually", "mostly"
        ]);

        const meaningfulWords = firstSentence
            .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special chars
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0)
            .filter(word => !functionWords.has(word.toLowerCase())) // Remove function words
            .slice(0, 4); // Take max 4 meaningful words

        if (meaningfulWords.length === 0) {
            return undefined;
        }

        // Improve word ordering for better semantic meaning
        const reorderedWords = reorderWordsForBetterSemantics(meaningfulWords);
        
        const cleaned = reorderedWords
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join("");

        return cleaned.length > 0 ? cleaned : undefined;
    }

    /**
     * Reorders words to create better semantic meaning in generated names
     */
    export function reorderWordsForBetterSemantics(words: string[]): string[] {
        if (words.length <= 2) {
            return words; // Short phrases are usually fine as-is
        }

        // More conservative reordering - only move modifying entities to the end
        const modifyingEntities = new Set(["system", "service", "api"]);
        const descriptiveTypes = new Set(["object", "method", "function", "interface", "model"]);
        
        const reordered: string[] = [];
        const modifiers: string[] = [];
        
        // First pass: collect main concepts and modifiers
        words.forEach(word => {
            const lowerWord = word.toLowerCase();
            if (modifyingEntities.has(lowerWord)) {
                modifiers.push(word); // Move system/service to end
            } else if (descriptiveTypes.has(lowerWord) && reordered.length > 0) {
                // Move generic types after the main concept
                reordered.splice(1, 0, word);
            } else {
                reordered.push(word);
            }
        });
        
        // Add modifiers at the end
        reordered.push(...modifiers);
        
        return reordered;
    }

    /**
     * Generates a name based on distinctive properties of an object schema
     */
    export function generateNameFromObjectProperties(
        schema: OpenAPIV3_1.SchemaObject,
        allVariants: OpenAPIV3_1.SchemaObject[]
    ): string | undefined {
        const schemaProperties = schema.properties;
        if (!schemaProperties) {
            return undefined;
        }
        
        const properties = Object.keys(schemaProperties);
        
        if (properties.length === 0) {
            return undefined;
        }

        // Find properties that are unique to this variant
        const uniqueProperties = findUniqueProperties(schema, allVariants);
        
        if (uniqueProperties.length > 0) {
            // Prioritize the most significant unique properties
            const significantUniqueProperties = getMostSignificantProperties(uniqueProperties);
            const nameParts = significantUniqueProperties
                .slice(0, 1) // Take only the most significant unique property for cleaner names
                .map(prop => capitalizePropertyName(prop));
            
            if (nameParts.length > 0) {
                return nameParts.join("");
            }
        }

        // If no unique properties, use the most significant properties
        const significantProperties = getMostSignificantProperties(properties);
        if (significantProperties.length > 0) {
            const nameParts = significantProperties
                .slice(0, 1) // Take only the most significant property for cleaner names
                .map(prop => capitalizePropertyName(prop));
            return nameParts.join("");
        }

        return undefined;
    }

    /**
     * Finds properties that are unique to this schema compared to other variants
     */
    export function findUniqueProperties(
        schema: OpenAPIV3_1.SchemaObject,
        allVariants: OpenAPIV3_1.SchemaObject[]
    ): string[] {
        const schemaProperties = schema.properties;
        if (!schemaProperties) {
            return [];
        }

        const thisProperties = new Set(Object.keys(schemaProperties));
        const otherProperties = new Set<string>();

        // Collect all properties from other variants
        allVariants.forEach(variant => {
            if (variant !== schema && variant.type === "object" && variant.properties) {
                const variantProperties = variant.properties;
                if (variantProperties) {
                    Object.keys(variantProperties).forEach(prop => {
                        otherProperties.add(prop);
                    });
                }
            }
        });

        // Return properties that are unique to this variant
        return Array.from(thisProperties).filter(prop => !otherProperties.has(prop));
    }

    /**
     * Gets the most significant properties from a list, prioritizing common business terms
     */
    export function getMostSignificantProperties(properties: string[]): string[] {
        // High-priority business/API terms that are very meaningful for naming
        const highPriorityTerms = [
            "status", "error", "type", "kind", "mode", "state", "action", "method",
            "enabled", "disabled", "active", "inactive", "success", "failed"
        ];
        
        // Medium-priority terms that are meaningful but less specific
        const mediumPriorityTerms = [
            "config", "configuration", "setting", "option", "message", "code",
            "user", "account", "profile", "auth", "token", "key",
            "response", "request", "result", "output", "input", "payload", "body"
        ];
        
        // Lower-priority terms that are generic but still useful
        const lowPriorityTerms = [
            "name", "id", "value", "data", "info"
        ];
        
        // Calculate significance score for each property
        const scoredProperties = properties.map(prop => {
            const lowerProp = prop.toLowerCase();
            let score = 0;
            
            // Check high-priority terms first
            for (const term of highPriorityTerms) {
                if (lowerProp === term) {
                    score += 15; // High priority exact match
                } else if (lowerProp.includes(term)) {
                    score += 10; // High priority partial match
                }
            }
            
            // Check medium-priority terms
            for (const term of mediumPriorityTerms) {
                if (lowerProp === term) {
                    score += 8; // Medium priority exact match
                } else if (lowerProp.includes(term)) {
                    score += 5; // Medium priority partial match
                }
            }
            
            // Check low-priority terms
            for (const term of lowPriorityTerms) {
                if (lowerProp === term) {
                    score += 3; // Low priority exact match
                } else if (lowerProp.includes(term)) {
                    score += 2; // Low priority partial match
                }
            }
            
            // Shorter property names are often more significant (but less important than semantic meaning)
            score += Math.max(0, 5 - prop.length);
            
            return { prop, score };
        });
        
        // Sort by score (highest first), then alphabetically
        return scoredProperties
            .sort((a, b) => {
                if (a.score !== b.score) { return b.score - a.score; }
                return a.prop.localeCompare(b.prop);
            })
            .map(item => item.prop);
    }

    /**
     * Capitalizes a property name for use in display names
     */
    export function capitalizePropertyName(prop: string): string {
        // Handle camelCase and snake_case
        if (prop.includes("_")) {
            return prop.split("_")
                .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join("");
        } else {
            // Assume camelCase, just capitalize first letter
            return prop.charAt(0).toUpperCase() + prop.slice(1);
        }
    }
} 