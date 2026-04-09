package com.fern.java.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fern.ir.model.commons.Name;
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
            return casingConfig.computeName(p.getText()).toName();
        }
        return CasingConfiguration.nameFromObjectNode(p.readValueAsTree());
    }
}
