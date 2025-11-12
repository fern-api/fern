package com.seed.exhaustive;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.exhaustive.core.ObjectMappers;
import com.seed.exhaustive.resources.types.object.types.ObjectWithOptionalField;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class NoReqBodyWireTest {
    private MockWebServer server;
    private SeedExhaustiveClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedExhaustiveClient.builder()
                .url(server.url("/").toString())
                .token("test-token")
                .build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testGetWithNoRequestBody() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"string\":\"string\",\"integer\":1,\"long\":1000000,\"double\":1.1,\"bool\":true,\"datetime\":\"2024-01-15T09:30:00Z\",\"date\":\"2023-01-15\",\"uuid\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\"base64\":\"SGVsbG8gd29ybGQh\",\"list\":[\"list\",\"list\"],\"set\":[\"set\"],\"map\":{\"1\":\"map\"},\"bigint\":\"1000000\"}"));
        ObjectWithOptionalField response = client.noReqBody().getWithNoRequestBody();
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"string\": \"string\",\n"
                + "  \"integer\": 1,\n"
                + "  \"long\": 1000000,\n"
                + "  \"double\": 1.1,\n"
                + "  \"bool\": true,\n"
                + "  \"datetime\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"date\": \"2023-01-15\",\n"
                + "  \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
                + "  \"base64\": \"SGVsbG8gd29ybGQh\",\n"
                + "  \"list\": [\n"
                + "    \"list\",\n"
                + "    \"list\"\n"
                + "  ],\n"
                + "  \"set\": [\n"
                + "    \"set\"\n"
                + "  ],\n"
                + "  \"map\": {\n"
                + "    \"1\": \"map\"\n"
                + "  },\n"
                + "  \"bigint\": \"1000000\"\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        JsonNode normalizedActualResponseNode = normalizeNumbers(actualResponseNode);
        JsonNode normalizedExpectedResponseNode = normalizeNumbers(expectedResponseNode);
        Assertions.assertEquals(
                normalizedExpectedResponseNode,
                normalizedActualResponseNode,
                "Response body structure does not match expected");
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type"))
                discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type"))
                discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind"))
                discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualResponseNode.isNull()) {
            Assertions.assertTrue(
                    actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(),
                    "response should be a valid JSON value");
        }

        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
        }
        if (actualResponseNode.isObject()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }

    @Test
    public void testPostWithNoRequestBody() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("\"string\""));
        String response = client.noReqBody().postWithNoRequestBody();
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "" + "\"string\"";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        JsonNode normalizedActualResponseNode = normalizeNumbers(actualResponseNode);
        JsonNode normalizedExpectedResponseNode = normalizeNumbers(expectedResponseNode);
        Assertions.assertEquals(
                normalizedExpectedResponseNode,
                normalizedActualResponseNode,
                "Response body structure does not match expected");
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type"))
                discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type"))
                discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind"))
                discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualResponseNode.isNull()) {
            Assertions.assertTrue(
                    actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(),
                    "response should be a valid JSON value");
        }

        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
        }
        if (actualResponseNode.isObject()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }

    /**
     * Normalizes numeric values in a JsonNode tree for comparison.
     * Converts whole number doubles (e.g., 149.0) to longs (e.g., 149).
     */
    private JsonNode normalizeNumbers(JsonNode node) {
        if (node.isNumber()) {
            double value = node.doubleValue();
            if (value == Math.floor(value) && !Double.isInfinite(value)) {
                return objectMapper.getNodeFactory().numberNode((long) value);
            }
            return node;
        }
        if (node.isObject()) {
            com.fasterxml.jackson.databind.node.ObjectNode normalized = objectMapper.createObjectNode();
            node.fields().forEachRemaining(entry -> {
                normalized.set(entry.getKey(), normalizeNumbers(entry.getValue()));
            });
            return normalized;
        }
        if (node.isArray()) {
            com.fasterxml.jackson.databind.node.ArrayNode normalized = objectMapper.createArrayNode();
            node.forEach(element -> normalized.add(normalizeNumbers(element)));
            return normalized;
        }
        return node;
    }
}
