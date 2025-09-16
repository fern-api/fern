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

public class UsersWireTest {
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
    public void testListWithCursorPagination() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        ListUsersPaginationResponse response = client.users().listWithCursorPagination(
            ListUsersCursorPaginationRequest
                .builder()
                .page(1)
                .perPage(1)
                .order(Order.ASC)
                .startingAfter("starting_after")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"hasNextPage\": true,\n" +
            "  \"page\": {\n" +
            "    \"page\": 1,\n" +
            "    \"next\": {\n" +
            "      \"page\": 1,\n" +
            "      \"starting_after\": \"starting_after\"\n" +
            "    },\n" +
            "    \"per_page\": 1,\n" +
            "    \"total_page\": 1\n" +
            "  },\n" +
            "  \"total_count\": 1,\n" +
            "  \"data\": [\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // Validate next cursor field for pagination navigation
        if (actualResponseNode.has("data")) {
            // Next cursor can be null for last page, or string for next page
            Assertions.assertTrue(actualResponseNode.get("data").isNull() || actualResponseNode.get("data").isTextual(), "Next cursor should be null (last page) or string (next page)");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithMixedTypeCursorPagination() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"next\":\"next\",\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        ListUsersMixedTypePaginationResponse response = client.users().listWithMixedTypeCursorPagination(
            ListUsersMixedTypeCursorPaginationRequest
                .builder()
                .cursor("cursor")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"next\": \"next\",\n" +
            "  \"data\": [\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // Validate next cursor field for pagination navigation
        if (actualResponseNode.has("data")) {
            // Next cursor can be null for last page, or string for next page
            Assertions.assertTrue(actualResponseNode.get("data").isNull() || actualResponseNode.get("data").isTextual(), "Next cursor should be null (last page) or string (next page)");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithBodyCursorPagination() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        ListUsersPaginationResponse response = client.users().listWithMixedTypeCursorPagination(
            ListUsersMixedTypeCursorPaginationRequest
                .builder()
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "{\n" +
            "  \"pagination\": {\n" +
            "    \"cursor\": \"cursor\"\n" +
            "  }\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
        // Enhanced union type validation
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type")) discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind")) discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualJson.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(), "request should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualJson.size(); i++) {
                JsonNode element = actualJson.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualJson.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"hasNextPage\": true,\n" +
            "  \"page\": {\n" +
            "    \"page\": 1,\n" +
            "    \"next\": {\n" +
            "      \"page\": 1,\n" +
            "      \"starting_after\": \"starting_after\"\n" +
            "    },\n" +
            "    \"per_page\": 1,\n" +
            "    \"total_page\": 1\n" +
            "  },\n" +
            "  \"total_count\": 1,\n" +
            "  \"data\": [\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // Validate next cursor field for pagination navigation
        if (actualResponseNode.has("data")) {
            // Next cursor can be null for last page, or string for next page
            Assertions.assertTrue(actualResponseNode.get("data").isNull() || actualResponseNode.get("data").isTextual(), "Next cursor should be null (last page) or string (next page)");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithOffsetPagination() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        ListUsersPaginationResponse response = client.users().listWithCursorPagination(
            ListUsersCursorPaginationRequest
                .builder()
                .page(1)
                .perPage(1)
                .order(Order.ASC)
                .startingAfter("starting_after")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"hasNextPage\": true,\n" +
            "  \"page\": {\n" +
            "    \"page\": 1,\n" +
            "    \"next\": {\n" +
            "      \"page\": 1,\n" +
            "      \"starting_after\": \"starting_after\"\n" +
            "    },\n" +
            "    \"per_page\": 1,\n" +
            "    \"total_page\": 1\n" +
            "  },\n" +
            "  \"total_count\": 1,\n" +
            "  \"data\": [\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithDoubleOffsetPagination() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        ListUsersPaginationResponse response = client.users().listWithCursorPagination(
            ListUsersCursorPaginationRequest
                .builder()
                .page(1.1)
                .perPage(1.1)
                .order(Order.ASC)
                .startingAfter("starting_after")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"hasNextPage\": true,\n" +
            "  \"page\": {\n" +
            "    \"page\": 1,\n" +
            "    \"next\": {\n" +
            "      \"page\": 1,\n" +
            "      \"starting_after\": \"starting_after\"\n" +
            "    },\n" +
            "    \"per_page\": 1,\n" +
            "    \"total_page\": 1\n" +
            "  },\n" +
            "  \"total_count\": 1,\n" +
            "  \"data\": [\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithBodyOffsetPagination() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        ListUsersPaginationResponse response = client.users().listWithMixedTypeCursorPagination(
            ListUsersMixedTypeCursorPaginationRequest
                .builder()
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "{\n" +
            "  \"pagination\": {\n" +
            "    \"page\": 1\n" +
            "  }\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
        // Enhanced union type validation
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type")) discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind")) discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualJson.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(), "request should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualJson.size(); i++) {
                JsonNode element = actualJson.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualJson.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"hasNextPage\": true,\n" +
            "  \"page\": {\n" +
            "    \"page\": 1,\n" +
            "    \"next\": {\n" +
            "      \"page\": 1,\n" +
            "      \"starting_after\": \"starting_after\"\n" +
            "    },\n" +
            "    \"per_page\": 1,\n" +
            "    \"total_page\": 1\n" +
            "  },\n" +
            "  \"total_count\": 1,\n" +
            "  \"data\": [\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithOffsetStepPagination() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        ListUsersPaginationResponse response = client.users().listWithOffsetStepPagination(
            ListUsersOffsetStepPaginationRequest
                .builder()
                .page(1)
                .limit(1)
                .order(Order.ASC)
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"hasNextPage\": true,\n" +
            "  \"page\": {\n" +
            "    \"page\": 1,\n" +
            "    \"next\": {\n" +
            "      \"page\": 1,\n" +
            "      \"starting_after\": \"starting_after\"\n" +
            "    },\n" +
            "    \"per_page\": 1,\n" +
            "    \"total_page\": 1\n" +
            "  },\n" +
            "  \"total_count\": 1,\n" +
            "  \"data\": [\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithOffsetPaginationHasNextPage() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        ListUsersPaginationResponse response = client.users().listWithOffsetStepPagination(
            ListUsersOffsetStepPaginationRequest
                .builder()
                .page(1)
                .limit(1)
                .order(Order.ASC)
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"hasNextPage\": true,\n" +
            "  \"page\": {\n" +
            "    \"page\": 1,\n" +
            "    \"next\": {\n" +
            "      \"page\": 1,\n" +
            "      \"starting_after\": \"starting_after\"\n" +
            "    },\n" +
            "    \"per_page\": 1,\n" +
            "    \"total_page\": 1\n" +
            "  },\n" +
            "  \"total_count\": 1,\n" +
            "  \"data\": [\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"name\",\n" +
            "      \"id\": 1\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithExtendedResults() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]},\"next\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\"}"));
        ListUsersExtendedResponse response = client.users().listWithExtendedResults(
            ListUsersExtendedRequest
                .builder()
                .cursor(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"total_count\": 1,\n" +
            "  \"data\": {\n" +
            "    \"users\": [\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"id\": 1\n" +
            "      },\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"id\": 1\n" +
            "      }\n" +
            "    ]\n" +
            "  },\n" +
            "  \"next\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // Validate next cursor field for pagination navigation
        if (actualResponseNode.has("data")) {
            // Next cursor can be null for last page, or string for next page
            Assertions.assertTrue(actualResponseNode.get("data").isNull() || actualResponseNode.get("data").isTextual(), "Next cursor should be null (last page) or string (next page)");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithExtendedResultsAndOptionalData() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]},\"next\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\"}"));
        ListUsersExtendedOptionalListResponse response = client.users().listWithExtendedResults(
            ListUsersExtendedRequest
                .builder()
                .cursor(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"total_count\": 1,\n" +
            "  \"data\": {\n" +
            "    \"users\": [\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"id\": 1\n" +
            "      },\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"id\": 1\n" +
            "      }\n" +
            "    ]\n" +
            "  },\n" +
            "  \"next\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // Validate next cursor field for pagination navigation
        if (actualResponseNode.has("data")) {
            // Next cursor can be null for last page, or string for next page
            Assertions.assertTrue(actualResponseNode.get("data").isNull() || actualResponseNode.get("data").isTextual(), "Next cursor should be null (last page) or string (next page)");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListUsernames() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"cursor\":{\"after\":\"after\",\"data\":[\"data\",\"data\"]}}"));
        UsernameCursor response = client.users().listWithCursorPagination(
            ListUsersCursorPaginationRequest
                .builder()
                .startingAfter("starting_after")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"cursor\": {\n" +
            "    \"after\": \"after\",\n" +
            "    \"data\": [\n" +
            "      \"data\",\n" +
            "      \"data\"\n" +
            "    ]\n" +
            "  }\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // Validate next cursor field for pagination navigation
        if (actualResponseNode.has("data")) {
            // Next cursor can be null for last page, or string for next page
            Assertions.assertTrue(actualResponseNode.get("data").isNull() || actualResponseNode.get("data").isTextual(), "Next cursor should be null (last page) or string (next page)");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
    @Test
    public void testListWithGlobalConfig() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"results\":[\"results\",\"results\"]}"));
        UsernameContainer response = client.users().listWithGlobalConfig(
            ListWithGlobalConfigRequest
                .builder()
                .offset(1)
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"results\": [\n" +
            "    \"results\",\n" +
            "    \"results\"\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        
        // Enhanced pagination validation
        // Validate pagination response structure
        // Validate results field at path: data
        if (actualResponseNode.has("data")) {
            Assertions.assertTrue(actualResponseNode.get("data").isArray(), "Pagination results should be an array");
            Assertions.assertTrue(actualResponseNode.get("data").size() >= 0, "Pagination results array should have valid size");
        }
        // General pagination structure validation
        Assertions.assertTrue(actualResponseNode.isObject(), "Paginated response should be an object");
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
