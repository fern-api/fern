package com.fern.java.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.commons.NameAndWireValueOrString;
import com.fern.ir.model.commons.NameOrString;
import java.io.IOException;

/**
 * Custom Jackson deserializer for {@link NameAndWireValueOrString} that handles both:
 *
 * <ul>
 *   <li>v65 object form: {@code {"wireValue": "...", "name": {...}}}
 *   <li>v66 compressed string form: {@code "myFieldName"} (wireValue == name)
 *   <li>v66 partial object form: {@code {"wireValue": "...", "name": "..."}} (name is a string)
 * </ul>
 *
 * Always produces the {@link NameAndWireValue} variant of {@link NameAndWireValueOrString}, using
 * {@link CasingConfiguration} to compute full Name from compressed strings.
 */
public final class NameAndWireValueDeserializer extends JsonDeserializer<NameAndWireValueOrString> {

    private final CasingConfiguration casingConfig;

    public NameAndWireValueDeserializer(CasingConfiguration casingConfig) {
        this.casingConfig = casingConfig;
    }

    @Override
    public NameAndWireValueOrString deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == JsonToken.VALUE_STRING) {
            String input = p.getText();
            return NameAndWireValueOrString.of(NameAndWireValue.builder()
                    .wireValue(input)
                    .name(NameOrString.of(casingConfig.computeName(input).toName()))
                    .build());
        }
        JsonNode node = p.readValueAsTree();
        return NameAndWireValueOrString.of(nameAndWireValueFromObjectNode(node));
    }

    private NameAndWireValue nameAndWireValueFromObjectNode(JsonNode node) {
        String wireValue = node.get("wireValue").asText();
        JsonNode nameNode = node.get("name");

        NameOrString name;
        if (nameNode.isTextual()) {
            name = NameOrString.of(casingConfig.computeName(nameNode.asText()).toName());
        } else {
            name = NameOrString.of(CasingConfiguration.nameFromObjectNode(nameNode));
        }

        return NameAndWireValue.builder().wireValue(wireValue).name(name).build();
    }
}
