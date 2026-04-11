package com.fern.java.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameOrString;
import java.io.IOException;

/**
 * Custom Jackson deserializer for {@link NameOrString} that handles both:
 *
 * <ul>
 *   <li>v65 object form: {@code {"originalName": "...", "camelCase": {...}, ...}}
 *   <li>v66 compressed string form: {@code "myFieldName"}
 * </ul>
 *
 * Always produces the {@link Name} variant of {@link NameOrString}, using {@link CasingConfiguration} to compute all
 * casing variants from compressed strings.
 */
public final class NameDeserializer extends JsonDeserializer<NameOrString> {

    private final CasingConfiguration casingConfig;

    public NameDeserializer(CasingConfiguration casingConfig) {
        this.casingConfig = casingConfig;
    }

    @Override
    public NameOrString deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == JsonToken.VALUE_STRING) {
            return NameOrString.of(casingConfig.computeName(p.getText()).toName());
        }
        return NameOrString.of(CasingConfiguration.nameFromObjectNode(p.readValueAsTree()));
    }

    /**
     * Deserializer for raw {@link Name} fields (e.g., within {@link com.fern.ir.model.commons.NameAndWireValue}).
     * Handles both v65 object form and v66 compressed string form.
     */
    public static final class RawNameDeserializer extends JsonDeserializer<Name> {

        private final CasingConfiguration casingConfig;

        public RawNameDeserializer(CasingConfiguration casingConfig) {
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
}
