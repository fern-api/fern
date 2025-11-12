package com.seed.exhaustive;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.exhaustive.core.ObjectMappers;
import com.seed.exhaustive.resources.reqwithheaders.requests.ReqWithHeaders;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ReqWithHeadersWireTest {
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
    public void testGetWithCustomHeader() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.reqWithHeaders()
                .getWithCustomHeader(ReqWithHeaders.builder()
                        .xTestServiceHeader("X-TEST-SERVICE-HEADER")
                        .xTestEndpointHeader("X-TEST-ENDPOINT-HEADER")
                        .body("string")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());

        // Validate headers
        Assertions.assertEquals(
                "X-TEST-SERVICE-HEADER",
                request.getHeader("X-TEST-SERVICE-HEADER"),
                "Header 'X-TEST-SERVICE-HEADER' should match expected value");
        Assertions.assertEquals(
                "X-TEST-ENDPOINT-HEADER",
                request.getHeader("X-TEST-ENDPOINT-HEADER"),
                "Header 'X-TEST-ENDPOINT-HEADER' should match expected value");
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "\"string\"";
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
