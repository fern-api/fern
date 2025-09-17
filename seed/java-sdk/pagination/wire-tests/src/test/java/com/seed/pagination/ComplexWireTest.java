package com.seed.pagination;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ComplexWireTest {
    private MockWebServer server;
    private SeedPaginationClient client;
    private ObjectMapper objectMapper = new ObjectMapper();
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedPaginationClient.builder()
            .url(server.url("/").toString())
            .token("test-token")
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testSearch() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"conversations\":[{\"foo\":\"foo\"},{\"foo\":\"foo\"}],\"pages\":{\"next\":{\"per_page\":1,\"starting_after\":\"starting_after\"},\"page\":1,\"per_page\":1,\"total_pages\":1,\"type\":\"pages\"},\"total_count\":1,\"type\":\"conversation.list\"}"));
        PaginatedConversationResponse response = client.complex().search(
            "index",
            SearchRequest
                .builder()
                .query(
                    SearchRequestQuery.ofSingleFilterSearchRequest(
                        SingleFilterSearchRequest
                            .builder()
                            .field("field")
                            .operator(SingleFilterSearchRequestOperator.EQUALS)
                            .value("value")
                            .build()
                    )
                )
                .pagination(
                    StartingAfterPaging
                        .builder()
                        .perPage(1)
                        .startingAfter("starting_after")
                        .build()
                )
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "{\n" +
            "  \"pagination\": {\n" +
            "    \"per_page\": 1,\n" +
            "    \"starting_after\": \"starting_after\"\n" +
            "  },\n" +
            "  \"query\": {\n" +
            "    \"field\": \"field\",\n" +
            "    \"operator\": \"=\",\n" +
            "    \"value\": \"value\"\n" +
            "  }\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type")) discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind")) discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        if (!actualJson.isNull()) {
            Assertions.assertTrue(actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(), "request should be a valid JSON value");
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
        String expectedResponseBody = "{\n" +
            "  \"conversations\": [\n" +
            "    {\n" +
            "      \"foo\": \"foo\"\n" +
            "    },\n" +
            "    {\n" +
            "      \"foo\": \"foo\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"pages\": {\n" +
            "    \"next\": {\n" +
            "      \"per_page\": 1,\n" +
            "      \"starting_after\": \"starting_after\"\n" +
            "    },\n" +
            "    \"page\": 1,\n" +
            "    \"per_page\": 1,\n" +
            "    \"total_pages\": 1,\n" +
            "    \"type\": \"pages\"\n" +
            "  },\n" +
            "  \"total_count\": 1,\n" +
            "  \"type\": \"conversation.list\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Pagination validation
        // Results at path: conversations
        if (actualResponseNode.has("conversations")) {
            Assertions.assertTrue(actualResponseNode.get("conversations").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("conversations").size() >= 0, "Pagination results array should have valid size");
        }
        // Next cursor at path: starting_after
        if (actualResponseNode.has("starting_after")) {
            // Next cursor can be null for last page, or string for next page
            Assertions.assertTrue(actualResponseNode.get("starting_after").isNull() || actualResponseNode.get("starting_after").isTextual(), "Next cursor should be null (last page) or string (next page)");
        }
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
