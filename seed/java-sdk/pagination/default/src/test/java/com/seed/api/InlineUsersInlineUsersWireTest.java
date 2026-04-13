package com.seed.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.api.core.ObjectMappers;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListUsernamesRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithBodyCursorPaginationRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithBodyOffsetPaginationRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithCursorPaginationRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithExtendedResultsRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithGlobalConfigRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithOffsetPaginationRequest;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithOffsetStepPaginationRequest;
import com.seed.api.types.InlineUsersListUsersExtendedOptionalListResponse;
import com.seed.api.types.InlineUsersListUsersExtendedResponse;
import com.seed.api.types.InlineUsersListUsersMixedTypePaginationResponse;
import com.seed.api.types.InlineUsersListUsersPaginationResponse;
import com.seed.api.types.InlineUsersUsernameContainer;
import com.seed.api.types.UsernameCursor;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class InlineUsersInlineUsersWireTest {
    private MockWebServer server;
    private SeedApiClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedApiClient.builder()
                .url(server.url("/").toString())
                .token("test-token")
                .build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testInlineUsersInlineUsersListWithCursorPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]}}"));
        InlineUsersListUsersPaginationResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithCursorPagination(
                        InlineUsersInlineUsersListWithCursorPaginationRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"hasNextPage\": true,\n"
                + "  \"page\": {\n"
                + "    \"page\": 1,\n"
                + "    \"next\": {\n"
                + "      \"page\": 1,\n"
                + "      \"starting_after\": \"starting_after\"\n"
                + "    },\n"
                + "    \"per_page\": 1,\n"
                + "    \"total_page\": 1\n"
                + "  },\n"
                + "  \"total_count\": 1,\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithMixedTypeCursorPagination() throws Exception {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"next\":\"next\",\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]}}"));
        InlineUsersListUsersMixedTypePaginationResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithMixedTypeCursorPagination(
                        InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"next\": \"next\",\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithBodyCursorPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]}}"));
        InlineUsersListUsersPaginationResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithBodyCursorPagination(
                        InlineUsersInlineUsersListWithBodyCursorPaginationRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "{}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertTrue(jsonEquals(expectedJson, actualJson), "Request body structure does not match expected");
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
        String expectedResponseBody = ""
                + "{\n"
                + "  \"hasNextPage\": true,\n"
                + "  \"page\": {\n"
                + "    \"page\": 1,\n"
                + "    \"next\": {\n"
                + "      \"page\": 1,\n"
                + "      \"starting_after\": \"starting_after\"\n"
                + "    },\n"
                + "    \"per_page\": 1,\n"
                + "    \"total_page\": 1\n"
                + "  },\n"
                + "  \"total_count\": 1,\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithOffsetPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]}}"));
        InlineUsersListUsersPaginationResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithOffsetPagination(
                        InlineUsersInlineUsersListWithOffsetPaginationRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"hasNextPage\": true,\n"
                + "  \"page\": {\n"
                + "    \"page\": 1,\n"
                + "    \"next\": {\n"
                + "      \"page\": 1,\n"
                + "      \"starting_after\": \"starting_after\"\n"
                + "    },\n"
                + "    \"per_page\": 1,\n"
                + "    \"total_page\": 1\n"
                + "  },\n"
                + "  \"total_count\": 1,\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithDoubleOffsetPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]}}"));
        InlineUsersListUsersPaginationResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithDoubleOffsetPagination(
                        InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"hasNextPage\": true,\n"
                + "  \"page\": {\n"
                + "    \"page\": 1,\n"
                + "    \"next\": {\n"
                + "      \"page\": 1,\n"
                + "      \"starting_after\": \"starting_after\"\n"
                + "    },\n"
                + "    \"per_page\": 1,\n"
                + "    \"total_page\": 1\n"
                + "  },\n"
                + "  \"total_count\": 1,\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithBodyOffsetPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]}}"));
        InlineUsersListUsersPaginationResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithBodyOffsetPagination(
                        InlineUsersInlineUsersListWithBodyOffsetPaginationRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "{}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertTrue(jsonEquals(expectedJson, actualJson), "Request body structure does not match expected");
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
        String expectedResponseBody = ""
                + "{\n"
                + "  \"hasNextPage\": true,\n"
                + "  \"page\": {\n"
                + "    \"page\": 1,\n"
                + "    \"next\": {\n"
                + "      \"page\": 1,\n"
                + "      \"starting_after\": \"starting_after\"\n"
                + "    },\n"
                + "    \"per_page\": 1,\n"
                + "    \"total_page\": 1\n"
                + "  },\n"
                + "  \"total_count\": 1,\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithOffsetStepPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]}}"));
        InlineUsersListUsersPaginationResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithOffsetStepPagination(
                        InlineUsersInlineUsersListWithOffsetStepPaginationRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"hasNextPage\": true,\n"
                + "  \"page\": {\n"
                + "    \"page\": 1,\n"
                + "    \"next\": {\n"
                + "      \"page\": 1,\n"
                + "      \"starting_after\": \"starting_after\"\n"
                + "    },\n"
                + "    \"per_page\": 1,\n"
                + "    \"total_page\": 1\n"
                + "  },\n"
                + "  \"total_count\": 1,\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithOffsetPaginationHasNextPage() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]}}"));
        InlineUsersListUsersPaginationResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
                        InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"hasNextPage\": true,\n"
                + "  \"page\": {\n"
                + "    \"page\": 1,\n"
                + "    \"next\": {\n"
                + "      \"page\": 1,\n"
                + "      \"starting_after\": \"starting_after\"\n"
                + "    },\n"
                + "    \"per_page\": 1,\n"
                + "    \"total_page\": 1\n"
                + "  },\n"
                + "  \"total_count\": 1,\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithExtendedResults() throws Exception {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]},\"next\":\"next\",\"total_count\":1}"));
        InlineUsersListUsersExtendedResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithExtendedResults(
                        InlineUsersInlineUsersListWithExtendedResultsRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  },\n"
                + "  \"next\": \"next\",\n"
                + "  \"total_count\": 1\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithExtendedResultsAndOptionalData() throws Exception {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"data\":{\"users\":[{\"name\":\"name\",\"id\":1}]},\"next\":\"next\",\"total_count\":1}"));
        InlineUsersListUsersExtendedOptionalListResponse response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithExtendedResultsAndOptionalData(
                        InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest.builder()
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"data\": {\n"
                + "    \"users\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"id\": 1\n"
                + "      }\n"
                + "    ]\n"
                + "  },\n"
                + "  \"next\": \"next\",\n"
                + "  \"total_count\": 1\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListUsernames() throws Exception {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"cursor\":{\"after\":\"after\",\"data\":[\"data\"]}}"));
        UsernameCursor response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListUsernames(
                        InlineUsersInlineUsersListUsernamesRequest.builder().build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"cursor\": {\n"
                + "    \"after\": \"after\",\n"
                + "    \"data\": [\n"
                + "      \"data\"\n"
                + "    ]\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
    public void testInlineUsersInlineUsersListWithGlobalConfig() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{\"results\":[\"results\"]}"));
        InlineUsersUsernameContainer response = client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithGlobalConfig(InlineUsersInlineUsersListWithGlobalConfigRequest.builder()
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "" + "{\n" + "  \"results\": [\n" + "    \"results\"\n" + "  ]\n" + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
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
     * Compares two JsonNodes with numeric equivalence and null safety.
     * For objects, checks that all fields in 'expected' exist in 'actual' with matching values.
     * Allows 'actual' to have extra fields (e.g., default values added during serialization).
     */
    private boolean jsonEquals(JsonNode expected, JsonNode actual) {
        if (expected == null && actual == null) return true;
        if (expected == null || actual == null) return false;
        if (expected.equals(actual)) return true;
        if (expected.isNumber() && actual.isNumber())
            return Math.abs(expected.doubleValue() - actual.doubleValue()) < 1e-10;
        if (expected.isObject() && actual.isObject()) {
            java.util.Iterator<java.util.Map.Entry<String, JsonNode>> iter = expected.fields();
            while (iter.hasNext()) {
                java.util.Map.Entry<String, JsonNode> entry = iter.next();
                JsonNode actualValue = actual.get(entry.getKey());
                if (actualValue == null || !jsonEquals(entry.getValue(), actualValue)) return false;
            }
            return true;
        }
        if (expected.isArray() && actual.isArray()) {
            if (expected.size() != actual.size()) return false;
            for (int i = 0; i < expected.size(); i++) {
                if (!jsonEquals(expected.get(i), actual.get(i))) return false;
            }
            return true;
        }
        return false;
    }
}
