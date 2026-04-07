package com.fern.java.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import java.io.IOException;

/**
 * Custom Jackson deserializer for {@link NameAndWireValue} that handles both:
 * <ul>
 *   <li>v65 object form: {@code {"wireValue": "...", "name": {...}}}</li>
 *   <li>v66 compressed string form: {@code "myFieldName"} (wireValue == name)</li>
 *   <li>v66 partial object form: {@code {"wireValue": "...", "name": "..."}} (name is a string)</li>
 * </ul>
 *
 * When a string is encountered, the string serves as both the wireValue and the name.
 * Uses {@link CasingConfiguration} to compute full Name from a string.
 */
public final class NameAndWireValueDeserializer extends JsonDeserializer<NameAndWireValue> {

    private final CasingConfiguration casingConfig;

    public NameAndWireValueDeserializer(CasingConfiguration casingConfig) {
        this.casingConfig = casingConfig;
    }

    @Override
    public NameAndWireValue deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == JsonToken.VALUE_STRING) {
            return nameAndWireValueFromString(p.getText());
        }
        // Object form — read as tree and handle both full and partial objects
        JsonNode node = p.readValueAsTree();
        return nameAndWireValueFromObjectNode(node);
    }

    private NameAndWireValue nameAndWireValueFromString(String input) {
        return NameAndWireValue.builder()
                .wireValue(input)
                .name(nameFromString(input))
                .build();
    }

    private NameAndWireValue nameAndWireValueFromObjectNode(JsonNode node) {
        String wireValue = node.get("wireValue").asText();
        JsonNode nameNode = node.get("name");

        Name name;
        if (nameNode.isTextual()) {
            // v66 partial object form: name is a compressed string
            name = nameFromString(nameNode.asText());
        } else {
            // v65 full object form: name is a full Name object
            name = nameFromObjectNode(nameNode);
        }

        return NameAndWireValue.builder()
                .wireValue(wireValue)
                .name(name)
                .build();
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
