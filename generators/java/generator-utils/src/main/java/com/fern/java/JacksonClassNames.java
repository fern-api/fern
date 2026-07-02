package com.fern.java;

import com.squareup.javapoet.ClassName;

/**
 * Provides the correct Jackson class names based on the configured Jackson version.
 *
 * <p>Jackson 3 relocated most packages from {@code com.fasterxml.jackson} to {@code tools.jackson}, except for
 * annotations which remain at {@code com.fasterxml.jackson.annotation}. Jackson 3 also integrated Jdk8Module and
 * JavaTimeModule into core databind.
 */
public final class JacksonClassNames {

    private static final String JACKSON2_DATABIND_PKG = "com.fasterxml.jackson.databind";
    private static final String JACKSON3_DATABIND_PKG = "tools.jackson.databind";

    private static final String JACKSON2_CORE_PKG = "com.fasterxml.jackson.core";
    private static final String JACKSON3_CORE_PKG = "tools.jackson.core";

    private final boolean useJackson3;

    public JacksonClassNames(ICustomConfig customConfig) {
        this.useJackson3 = customConfig.jacksonVersion() == ICustomConfig.JacksonVersion.V3;
    }

    public boolean isJackson3() {
        return useJackson3;
    }

    private String databindPackage() {
        return useJackson3 ? JACKSON3_DATABIND_PKG : JACKSON2_DATABIND_PKG;
    }

    private String corePackage() {
        return useJackson3 ? JACKSON3_CORE_PKG : JACKSON2_CORE_PKG;
    }

    // --- databind types ---

    public ClassName objectMapper() {
        return ClassName.get(databindPackage(), "ObjectMapper");
    }

    public ClassName jsonNode() {
        return ClassName.get(databindPackage(), "JsonNode");
    }

    public ClassName objectNode() {
        return ClassName.get(databindPackage() + ".node", "ObjectNode");
    }

    public ClassName arrayNode() {
        return ClassName.get(databindPackage() + ".node", "ArrayNode");
    }

    public ClassName jsonNodeFactory() {
        return ClassName.get(databindPackage() + ".node", "JsonNodeFactory");
    }

    public ClassName jsonMapper() {
        return ClassName.get(databindPackage() + ".json", "JsonMapper");
    }

    public ClassName deserializationFeature() {
        return ClassName.get(databindPackage(), "DeserializationFeature");
    }

    public ClassName serializationFeature() {
        return ClassName.get(databindPackage(), "SerializationFeature");
    }

    public ClassName jsonDeserialize() {
        return ClassName.get(databindPackage() + ".annotation", "JsonDeserialize");
    }

    public ClassName stdDeserializer() {
        return ClassName.get(databindPackage() + ".deser.std", "StdDeserializer");
    }

    public ClassName deserializationContext() {
        return ClassName.get(databindPackage(), "DeserializationContext");
    }

    public ClassName simpleModule() {
        return ClassName.get(databindPackage() + ".module", "SimpleModule");
    }

    public ClassName jsonSerializer() {
        return ClassName.get(databindPackage(), "JsonSerializer");
    }

    public ClassName serializerProvider() {
        return ClassName.get(databindPackage(), "SerializerProvider");
    }

    public ClassName jsonDeserializerClass() {
        return ClassName.get(databindPackage(), "JsonDeserializer");
    }

    public ClassName jsonProcessingException() {
        return ClassName.get(corePackage(), "JsonProcessingException");
    }

    // --- core types ---

    public ClassName typeReference() {
        return ClassName.get(corePackage() + ".type", "TypeReference");
    }

    public ClassName jsonParser() {
        return ClassName.get(corePackage(), "JsonParser");
    }

    public ClassName jsonParseException() {
        return ClassName.get(corePackage(), "JsonParseException");
    }

    public ClassName jsonGenerator() {
        return ClassName.get(corePackage(), "JsonGenerator");
    }

    public ClassName jsonToken() {
        return ClassName.get(corePackage(), "JsonToken");
    }

    /**
     * Transforms resource template contents by replacing Jackson 2 package names with Jackson 3 package names when
     * Jackson 3 is configured.
     */
    public String transformResourceContents(String contents) {
        if (!useJackson3) {
            return contents;
        }
        String result = contents;
        // Replace databind packages (must come before core to avoid partial matches)
        result = result.replace("com.fasterxml.jackson.databind", "tools.jackson.databind");
        result = result.replace("com.fasterxml.jackson.core", "tools.jackson.core");
        // Remove Jdk8Module and JavaTimeModule imports and registrations (built into Jackson 3)
        result = result.replace("import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;\n", "");
        result = result.replace("import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;\n", "");
        return result;
    }
}
