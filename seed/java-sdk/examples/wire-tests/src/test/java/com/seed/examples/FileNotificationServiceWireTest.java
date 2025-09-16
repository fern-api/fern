package com.seed.examples;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class FileNotificationServiceWireTest {
    private MockWebServer server;
    private SeedExamplesClient client;
    private ObjectMapper objectMapper = new ObjectMapper();
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedExamplesClient.builder()
            .url(server.url("/").toString())
            .token("test-token")
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testGetException() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"type\":\"generic\",\"exceptionType\":\"Unavailable\",\"exceptionMessage\":\"This component is unavailable!\",\"exceptionStacktrace\":\"<logs>\"}"));
        Exception response = client.file().notification().service().getException("notification-hsy129x");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"type\": \"generic\",\n" +
            "  \"exceptionType\": \"Unavailable\",\n" +
            "  \"exceptionMessage\": \"This component is unavailable!\",\n" +
            "  \"exceptionStacktrace\": \"<logs>\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        // Enhanced union type validation
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type")) discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type")) discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind")) discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualResponseNode.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(), "response should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualResponseNode.size(); i++) {
                JsonNode element = actualResponseNode.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualResponseNode.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }
}
