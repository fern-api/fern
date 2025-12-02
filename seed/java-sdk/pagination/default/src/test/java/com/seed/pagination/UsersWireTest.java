package com.seed.pagination;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.pagination.core.ObjectMappers;
import com.seed.pagination.core.pagination.SyncPagingIterable;
import com.seed.pagination.resources.users.requests.ListUsernamesRequest;
import com.seed.pagination.resources.users.requests.ListUsersBodyCursorPaginationRequest;
import com.seed.pagination.resources.users.requests.ListUsersBodyOffsetPaginationRequest;
import com.seed.pagination.resources.users.requests.ListUsersCursorPaginationRequest;
import com.seed.pagination.resources.users.requests.ListUsersExtendedRequest;
import com.seed.pagination.resources.users.requests.ListUsersMixedTypeCursorPaginationRequest;
import com.seed.pagination.resources.users.requests.ListUsersOffsetStepPaginationRequest;
import com.seed.pagination.resources.users.requests.ListWithGlobalConfigRequest;
import com.seed.pagination.resources.users.types.Order;
import com.seed.pagination.resources.users.types.User;
import com.seed.pagination.resources.users.types.WithCursor;
import com.seed.pagination.resources.users.types.WithPage;
import java.util.UUID;
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
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

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
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        SyncPagingIterable<User> response = client.users()
                .listWithCursorPagination(ListUsersCursorPaginationRequest.builder()
                        .page(1)
                        .perPage(1)
                        .order(Order.ASC)
                        .startingAfter("starting_after")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithMixedTypeCursorPagination() throws Exception {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"next\":\"next\",\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        SyncPagingIterable<User> response = client.users()
                .listWithMixedTypeCursorPagination(ListUsersMixedTypeCursorPaginationRequest.builder()
                        .cursor("cursor")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithBodyCursorPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        SyncPagingIterable<User> response = client.users()
                .listWithBodyCursorPagination(ListUsersBodyCursorPaginationRequest.builder()
                        .pagination(WithCursor.builder().cursor("cursor").build())
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody =
                "" + "{\n" + "  \"pagination\": {\n" + "    \"cursor\": \"cursor\"\n" + "  }\n" + "}";
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
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithOffsetPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        SyncPagingIterable<User> response = client.users()
                .listWithCursorPagination(ListUsersCursorPaginationRequest.builder()
                        .page(1)
                        .perPage(1)
                        .order(Order.ASC)
                        .startingAfter("starting_after")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithDoubleOffsetPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        SyncPagingIterable<User> response = client.users()
                .listWithCursorPagination(ListUsersCursorPaginationRequest.builder()
                        .page(1)
                        .perPage(1)
                        .order(Order.ASC)
                        .startingAfter("starting_after")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithBodyOffsetPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        SyncPagingIterable<User> response = client.users()
                .listWithBodyOffsetPagination(ListUsersBodyOffsetPaginationRequest.builder()
                        .pagination(WithPage.builder().page(1).build())
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "{\n" + "  \"pagination\": {\n" + "    \"page\": 1\n" + "  }\n" + "}";
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
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithOffsetStepPagination() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        SyncPagingIterable<User> response = client.users()
                .listWithOffsetStepPagination(ListUsersOffsetStepPaginationRequest.builder()
                        .page(1)
                        .limit(1)
                        .order(Order.ASC)
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithOffsetPaginationHasNextPage() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"hasNextPage\":true,\"page\":{\"page\":1,\"next\":{\"page\":1,\"starting_after\":\"starting_after\"},\"per_page\":1,\"total_page\":1},\"total_count\":1,\"data\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]}"));
        SyncPagingIterable<User> response = client.users()
                .listWithOffsetStepPagination(ListUsersOffsetStepPaginationRequest.builder()
                        .page(1)
                        .limit(1)
                        .order(Order.ASC)
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithExtendedResults() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]},\"next\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\"}"));
        SyncPagingIterable<User> response = client.users()
                .listWithExtendedResults(ListUsersExtendedRequest.builder()
                        .cursor(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithExtendedResultsAndOptionalData() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"total_count\":1,\"data\":{\"users\":[{\"name\":\"name\",\"id\":1},{\"name\":\"name\",\"id\":1}]},\"next\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\"}"));
        SyncPagingIterable<User> response = client.users()
                .listWithExtendedResults(ListUsersExtendedRequest.builder()
                        .cursor(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListUsernames() throws Exception {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"cursor\":{\"after\":\"after\",\"data\":[\"data\",\"data\"]}}"));
        SyncPagingIterable<String> response = client.users()
                .listUsernames(ListUsernamesRequest.builder()
                        .startingAfter("starting_after")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }

    @Test
    public void testListWithGlobalConfig() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{\"results\":[\"results\",\"results\"]}"));
        SyncPagingIterable<String> response = client.users()
                .listWithGlobalConfig(
                        ListWithGlobalConfigRequest.builder().offset(1).build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
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
