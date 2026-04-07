package com.fern.java.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import java.io.IOException;

/**
 * Custom Jackson deserializer for {@link Name} that handles both:
 *
 * <ul>
 *   <li>v65 object form: {@code {"originalName": "...", "camelCase": {...}, ...}}
 *   <li>v66 compressed string form: {@code "myFieldName"}
 * </ul>
 *
 * When a string is encountered, uses {@link CasingConfiguration} to compute all casing variants, replicating the
 * TypeScript CasingsGenerator's computeName behavior.
 */
public final class NameDeserializer extends JsonDeserializer<Name> {

    private final CasingConfiguration casingConfig;

    public NameDeserializer(CasingConfiguration casingConfig) {
        this.casingConfig = casingConfig;
    }

    @Override
    public Name deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == JsonToken.VALUE_STRING) {
            return nameFromString(p.getText());
        }
        // Object form — delegate to default deserialization via tree model
        JsonNode node = p.readValueAsTree();
        return nameFromObjectNode(node);
    }

    private Name nameFromString(String input) {
        CasingConfiguration.NameParts parts = casingConfig.computeName(input);
        return Name.builder()
                .originalName(parts.originalName)
                .camelCase(SafeAndUnsafeString.builder()
                        .unsafeName(parts.camelUnsafe)
                        .safeName(parts.camelSafe)
                        .build())
                .pascalCase(SafeAndUnsafeString.builder()
                        .unsafeName(parts.pascalUnsafe)
                        .safeName(parts.pascalSafe)
                        .build())
                .snakeCase(SafeAndUnsafeString.builder()
                        .unsafeName(parts.snakeUnsafe)
                        .safeName(parts.snakeSafe)
                        .build())
                .screamingSnakeCase(SafeAndUnsafeString.builder()
                        .unsafeName(parts.screamingSnakeUnsafe)
                        .safeName(parts.screamingSnakeSafe)
                        .build())
                .build();
    }

    private Name nameFromObjectNode(JsonNode node) {
        return Name.builder()
                .originalName(node.get("originalName").asText())
                .camelCase(safeAndUnsafeFromNode(node.get("camelCase")))
                .pascalCase(safeAndUnsafeFromNode(node.get("pascalCase")))
                .snakeCase(safeAndUnsafeFromNode(node.get("snakeCase")))
                .screamingSnakeCase(safeAndUnsafeFromNode(node.get("screamingSnakeCase")))
                .build();
    }

    private SafeAndUnsafeString safeAndUnsafeFromNode(JsonNode node) {
        return SafeAndUnsafeString.builder()
                .unsafeName(node.get("unsafeName").asText())
                .safeName(node.get("safeName").asText())
                .build();
    }
}
