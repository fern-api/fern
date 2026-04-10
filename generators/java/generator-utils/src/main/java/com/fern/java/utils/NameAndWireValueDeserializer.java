package com.fern.java.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameAndWireValue;
import java.io.IOException;

/**
 * Custom Jackson deserializer for {@link NameAndWireValue} that handles both:
 *
 * <ul>
 *   <li>v65 object form: {@code {"wireValue": "...", "name": {...}}}
 *   <li>v66 compressed string form: {@code "myFieldName"} (wireValue == name)
 *   <li>v66 partial object form: {@code {"wireValue": "...", "name": "..."}} (name is a string)
 * </ul>
 *
 * When a string is encountered, the string serves as both the wireValue and the name. Uses {@link CasingConfiguration}
 * to compute full Name from a string.
 */
public final class NameAndWireValueDeserializer extends JsonDeserializer<NameAndWireValue> {

    private final CasingConfiguration casingConfig;

    public NameAndWireValueDeserializer(CasingConfiguration casingConfig) {
        this.casingConfig = casingConfig;
    }

    @Override
    public NameAndWireValue deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == JsonToken.VALUE_STRING) {
            String input = p.getText();
            return NameAndWireValue.builder()
                    .wireValue(input)
                    .name(casingConfig.computeName(input).toName())
                    .build();
        }
        JsonNode node = p.readValueAsTree();
        return nameAndWireValueFromObjectNode(node);
    }

    private NameAndWireValue nameAndWireValueFromObjectNode(JsonNode node) {
        String wireValue = node.get("wireValue").asText();
        JsonNode nameNode = node.get("name");

        Name name;
        if (nameNode.isTextual()) {
            name = casingConfig.computeName(nameNode.asText()).toName();
        } else {
            name = CasingConfiguration.nameFromObjectNode(nameNode);
        }

        return NameAndWireValue.builder().wireValue(wireValue).name(name).build();
    }
}
