package com.seed.exhaustive;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.exhaustive.core.ObjectMappers;
import java.util.HashMap;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class NoAuthWireTest {
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
    public void testPostWithNoAuth() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("true"));
        Boolean response = client.noAuth().postWithNoAuth(new HashMap<String, Object>() {
            {
                put("key", "value");
            }
        });
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "{\n" + "  \"key\": \"value\"\n" + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        JsonNode normalizedActualJson = normalizeNumbers(actualJson);
        JsonNode normalizedExpectedJson = normalizeNumbers(expectedJson);
        Assertions.assertEquals(
                normalizedExpectedJson, normalizedActualJson, "Request body structure does not match expected");
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type"))
                discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind"))
                discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualJson.isNull()) {
            Assertions.assertTrue(
                    actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(),
                    "request should be a valid JSON value");
        }

        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
        }
        if (actualJson.isObject()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "" + "true";
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
