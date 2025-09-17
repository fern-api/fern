package com.seed.exhaustive;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class EndpointsPutWireTest {
    private MockWebServer server;
    private SeedExhaustiveClient client;
    private ObjectMapper objectMapper = new ObjectMapper();
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
    public void testAdd() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"errors\":[{\"category\":\"API_ERROR\",\"code\":\"INTERNAL_SERVER_ERROR\",\"detail\":\"detail\",\"field\":\"field\"},{\"category\":\"API_ERROR\",\"code\":\"INTERNAL_SERVER_ERROR\",\"detail\":\"detail\",\"field\":\"field\"}]}"));
        PutResponse response = client.endpoints().put().add(
            PutRequest
                .builder()
                .id("id")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PUT", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
            + "{\n"
            + "  \"errors\": [\n"
            + "    {\n"
            + "      \"category\": \"API_ERROR\",\n"
            + "      \"code\": \"INTERNAL_SERVER_ERROR\",\n"
            + "      \"detail\": \"detail\",\n"
            + "      \"field\": \"field\"\n"
            + "    },\n"
            + "    {\n"
            + "      \"category\": \"API_ERROR\",\n"
            + "      \"code\": \"INTERNAL_SERVER_ERROR\",\n"
            + "      \"detail\": \"detail\",\n"
            + "      \"field\": \"field\"\n"
            + "    }\n"
            + "  ]\n"
            + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type")) discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type")) discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind")) discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        if (!actualResponseNode.isNull()) {
            Assertions.assertTrue(actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(), "response should be a valid JSON value");
        }
        
        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
        }
        if (actualResponseNode.isObject()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }
}
