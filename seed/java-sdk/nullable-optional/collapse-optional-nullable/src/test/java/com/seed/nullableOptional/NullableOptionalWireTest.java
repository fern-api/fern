package com.seed.nullableOptional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.nullableOptional.core.ObjectMappers;
import com.seed.nullableOptional.resources.nullableoptional.requests.FilterByRoleRequest;
import com.seed.nullableOptional.resources.nullableoptional.requests.ListUsersRequest;
import com.seed.nullableOptional.resources.nullableoptional.requests.SearchRequest;
import com.seed.nullableOptional.resources.nullableoptional.requests.SearchUsersRequest;
import com.seed.nullableOptional.resources.nullableoptional.requests.UpdateComplexProfileRequest;
import com.seed.nullableOptional.resources.nullableoptional.requests.UpdateTagsRequest;
import com.seed.nullableOptional.resources.nullableoptional.types.Address;
import com.seed.nullableOptional.resources.nullableoptional.types.ComplexProfile;
import com.seed.nullableOptional.resources.nullableoptional.types.CreateUserRequest;
import com.seed.nullableOptional.resources.nullableoptional.types.DeserializationTestRequest;
import com.seed.nullableOptional.resources.nullableoptional.types.DeserializationTestResponse;
import com.seed.nullableOptional.resources.nullableoptional.types.EmailNotification;
import com.seed.nullableOptional.resources.nullableoptional.types.NotificationMethod;
import com.seed.nullableOptional.resources.nullableoptional.types.Organization;
import com.seed.nullableOptional.resources.nullableoptional.types.SearchResult;
import com.seed.nullableOptional.resources.nullableoptional.types.UpdateUserRequest;
import com.seed.nullableOptional.resources.nullableoptional.types.UserResponse;
import com.seed.nullableOptional.resources.nullableoptional.types.UserRole;
import com.seed.nullableOptional.resources.nullableoptional.types.UserStatus;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class NullableOptionalWireTest {
    private MockWebServer server;
    private SeedNullableOptionalClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedNullableOptionalClient.builder()
                .url(server.url("/").toString())
                .build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testGetUser() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}}"));
        UserResponse response = client.nullableOptional().getUser("userId");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"id\": \"id\",\n"
                + "  \"username\": \"username\",\n"
                + "  \"email\": \"email\",\n"
                + "  \"phone\": \"phone\",\n"
                + "  \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"address\": {\n"
                + "    \"street\": \"street\",\n"
                + "    \"city\": \"city\",\n"
                + "    \"state\": \"state\",\n"
                + "    \"zipCode\": \"zipCode\",\n"
                + "    \"country\": \"country\",\n"
                + "    \"buildingId\": \"buildingId\",\n"
                + "    \"tenantId\": \"tenantId\"\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testCreateUser() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}}"));
        UserResponse response = client.nullableOptional()
                .createUser(CreateUserRequest.builder()
                        .username("username")
                        .email("email")
                        .phone("phone")
                        .address(Address.builder()
                                .street("street")
                                .zipCode("zipCode")
                                .city("city")
                                .state("state")
                                .country("country")
                                .buildingId("buildingId")
                                .tenantId("tenantId")
                                .build())
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"username\": \"username\",\n"
                + "  \"email\": \"email\",\n"
                + "  \"phone\": \"phone\",\n"
                + "  \"address\": {\n"
                + "    \"street\": \"street\",\n"
                + "    \"city\": \"city\",\n"
                + "    \"state\": \"state\",\n"
                + "    \"zipCode\": \"zipCode\",\n"
                + "    \"country\": \"country\",\n"
                + "    \"buildingId\": \"buildingId\",\n"
                + "    \"tenantId\": \"tenantId\"\n"
                + "  }\n"
                + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
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
                + "  \"id\": \"id\",\n"
                + "  \"username\": \"username\",\n"
                + "  \"email\": \"email\",\n"
                + "  \"phone\": \"phone\",\n"
                + "  \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"address\": {\n"
                + "    \"street\": \"street\",\n"
                + "    \"city\": \"city\",\n"
                + "    \"state\": \"state\",\n"
                + "    \"zipCode\": \"zipCode\",\n"
                + "    \"country\": \"country\",\n"
                + "    \"buildingId\": \"buildingId\",\n"
                + "    \"tenantId\": \"tenantId\"\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testUpdateUser() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}}"));
        UserResponse response = client.nullableOptional()
                .updateUser(
                        "userId",
                        UpdateUserRequest.builder()
                                .username("username")
                                .email("email")
                                .phone("phone")
                                .address(Address.builder()
                                        .street("street")
                                        .zipCode("zipCode")
                                        .city("city")
                                        .state("state")
                                        .country("country")
                                        .buildingId("buildingId")
                                        .tenantId("tenantId")
                                        .build())
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PATCH", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"username\": \"username\",\n"
                + "  \"email\": \"email\",\n"
                + "  \"phone\": \"phone\",\n"
                + "  \"address\": {\n"
                + "    \"street\": \"street\",\n"
                + "    \"city\": \"city\",\n"
                + "    \"state\": \"state\",\n"
                + "    \"zipCode\": \"zipCode\",\n"
                + "    \"country\": \"country\",\n"
                + "    \"buildingId\": \"buildingId\",\n"
                + "    \"tenantId\": \"tenantId\"\n"
                + "  }\n"
                + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
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
                + "  \"id\": \"id\",\n"
                + "  \"username\": \"username\",\n"
                + "  \"email\": \"email\",\n"
                + "  \"phone\": \"phone\",\n"
                + "  \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"address\": {\n"
                + "    \"street\": \"street\",\n"
                + "    \"city\": \"city\",\n"
                + "    \"state\": \"state\",\n"
                + "    \"zipCode\": \"zipCode\",\n"
                + "    \"country\": \"country\",\n"
                + "    \"buildingId\": \"buildingId\",\n"
                + "    \"tenantId\": \"tenantId\"\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testListUsers() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "[{\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},{\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}}]"));
        List<UserResponse> response = client.nullableOptional()
                .listUsers(ListUsersRequest.builder()
                        .limit(1)
                        .offset(1)
                        .includeDeleted(true)
                        .sortBy("sortBy")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "[\n"
                + "  {\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  {\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  }\n"
                + "]";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testSearchUsers() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "[{\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},{\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}}]"));
        List<UserResponse> response = client.nullableOptional()
                .searchUsers(SearchUsersRequest.builder()
                        .query("query")
                        .department("department")
                        .role("role")
                        .isActive(true)
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "[\n"
                + "  {\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  {\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  }\n"
                + "]";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testCreateComplexProfile() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"nullableRole\":\"ADMIN\",\"optionalRole\":\"ADMIN\",\"optionalNullableRole\":\"ADMIN\",\"nullableStatus\":\"active\",\"optionalStatus\":\"active\",\"optionalNullableStatus\":\"active\",\"nullableNotification\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"optionalNotification\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"optionalNullableNotification\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"nullableSearchResult\":{\"type\":\"user\",\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"optionalSearchResult\":{\"type\":\"user\",\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"nullableArray\":[\"nullableArray\",\"nullableArray\"],\"optionalArray\":[\"optionalArray\",\"optionalArray\"],\"optionalNullableArray\":[\"optionalNullableArray\",\"optionalNullableArray\"],\"nullableListOfNullables\":[\"nullableListOfNullables\",\"nullableListOfNullables\"],\"nullableMapOfNullables\":{\"nullableMapOfNullables\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"nullableListOfUnions\":[{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"}],\"optionalMapOfEnums\":{\"optionalMapOfEnums\":\"ADMIN\"}}"));
        ComplexProfile response = client.nullableOptional()
                .createComplexProfile(ComplexProfile.builder()
                        .id("id")
                        .nullableRole(UserRole.ADMIN)
                        .optionalRole(UserRole.ADMIN)
                        .optionalNullableRole(UserRole.ADMIN)
                        .nullableStatus(UserStatus.ACTIVE)
                        .optionalStatus(UserStatus.ACTIVE)
                        .optionalNullableStatus(UserStatus.ACTIVE)
                        .nullableNotification(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build()))
                        .optionalNotification(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build()))
                        .optionalNullableNotification(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build()))
                        .nullableSearchResult(SearchResult.user(UserResponse.builder()
                                .id("id")
                                .username("username")
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .email("email")
                                .phone("phone")
                                .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .address(Address.builder()
                                        .street("street")
                                        .zipCode("zipCode")
                                        .city("city")
                                        .state("state")
                                        .country("country")
                                        .buildingId("buildingId")
                                        .tenantId("tenantId")
                                        .build())
                                .build()))
                        .optionalSearchResult(SearchResult.user(UserResponse.builder()
                                .id("id")
                                .username("username")
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .email("email")
                                .phone("phone")
                                .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .address(Address.builder()
                                        .street("street")
                                        .zipCode("zipCode")
                                        .city("city")
                                        .state("state")
                                        .country("country")
                                        .buildingId("buildingId")
                                        .tenantId("tenantId")
                                        .build())
                                .build()))
                        .nullableArray(Optional.of(Arrays.asList("nullableArray", "nullableArray")))
                        .optionalArray(Optional.of(Arrays.asList("optionalArray", "optionalArray")))
                        .optionalNullableArray(
                                Optional.of(Arrays.asList("optionalNullableArray", "optionalNullableArray")))
                        .nullableListOfNullables(Optional.of(Arrays.asList(
                                Optional.of("nullableListOfNullables"), Optional.of("nullableListOfNullables"))))
                        .nullableMapOfNullables(new HashMap<String, Optional<Address>>() {
                            {
                                put(
                                        "nullableMapOfNullables",
                                        Optional.of(Address.builder()
                                                .street("street")
                                                .zipCode("zipCode")
                                                .city(Optional.of("city"))
                                                .state(Optional.of("state"))
                                                .country(Optional.of("country"))
                                                .buildingId(Optional.of("buildingId"))
                                                .tenantId(Optional.of("tenantId"))
                                                .build()));
                            }
                        })
                        .nullableListOfUnions(Optional.of(Arrays.asList(
                                NotificationMethod.email(EmailNotification.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .htmlContent("htmlContent")
                                        .build()),
                                NotificationMethod.email(EmailNotification.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .htmlContent("htmlContent")
                                        .build()))))
                        .optionalMapOfEnums(new HashMap<String, UserRole>() {
                            {
                                put("optionalMapOfEnums", UserRole.ADMIN);
                            }
                        })
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"id\": \"id\",\n"
                + "  \"nullableRole\": \"ADMIN\",\n"
                + "  \"optionalRole\": \"ADMIN\",\n"
                + "  \"optionalNullableRole\": \"ADMIN\",\n"
                + "  \"nullableStatus\": \"active\",\n"
                + "  \"optionalStatus\": \"active\",\n"
                + "  \"optionalNullableStatus\": \"active\",\n"
                + "  \"nullableNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"optionalNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"optionalNullableNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"nullableSearchResult\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"optionalSearchResult\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableArray\": [\n"
                + "    \"nullableArray\",\n"
                + "    \"nullableArray\"\n"
                + "  ],\n"
                + "  \"optionalArray\": [\n"
                + "    \"optionalArray\",\n"
                + "    \"optionalArray\"\n"
                + "  ],\n"
                + "  \"optionalNullableArray\": [\n"
                + "    \"optionalNullableArray\",\n"
                + "    \"optionalNullableArray\"\n"
                + "  ],\n"
                + "  \"nullableListOfNullables\": [\n"
                + "    \"nullableListOfNullables\",\n"
                + "    \"nullableListOfNullables\"\n"
                + "  ],\n"
                + "  \"nullableMapOfNullables\": {\n"
                + "    \"nullableMapOfNullables\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableListOfUnions\": [\n"
                + "    {\n"
                + "      \"type\": \"email\",\n"
                + "      \"emailAddress\": \"emailAddress\",\n"
                + "      \"subject\": \"subject\",\n"
                + "      \"htmlContent\": \"htmlContent\"\n"
                + "    },\n"
                + "    {\n"
                + "      \"type\": \"email\",\n"
                + "      \"emailAddress\": \"emailAddress\",\n"
                + "      \"subject\": \"subject\",\n"
                + "      \"htmlContent\": \"htmlContent\"\n"
                + "    }\n"
                + "  ],\n"
                + "  \"optionalMapOfEnums\": {\n"
                + "    \"optionalMapOfEnums\": \"ADMIN\"\n"
                + "  }\n"
                + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
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
                + "  \"id\": \"id\",\n"
                + "  \"nullableRole\": \"ADMIN\",\n"
                + "  \"optionalRole\": \"ADMIN\",\n"
                + "  \"optionalNullableRole\": \"ADMIN\",\n"
                + "  \"nullableStatus\": \"active\",\n"
                + "  \"optionalStatus\": \"active\",\n"
                + "  \"optionalNullableStatus\": \"active\",\n"
                + "  \"nullableNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"optionalNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"optionalNullableNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"nullableSearchResult\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"optionalSearchResult\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableArray\": [\n"
                + "    \"nullableArray\",\n"
                + "    \"nullableArray\"\n"
                + "  ],\n"
                + "  \"optionalArray\": [\n"
                + "    \"optionalArray\",\n"
                + "    \"optionalArray\"\n"
                + "  ],\n"
                + "  \"optionalNullableArray\": [\n"
                + "    \"optionalNullableArray\",\n"
                + "    \"optionalNullableArray\"\n"
                + "  ],\n"
                + "  \"nullableListOfNullables\": [\n"
                + "    \"nullableListOfNullables\",\n"
                + "    \"nullableListOfNullables\"\n"
                + "  ],\n"
                + "  \"nullableMapOfNullables\": {\n"
                + "    \"nullableMapOfNullables\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableListOfUnions\": [\n"
                + "    {\n"
                + "      \"type\": \"email\",\n"
                + "      \"emailAddress\": \"emailAddress\",\n"
                + "      \"subject\": \"subject\",\n"
                + "      \"htmlContent\": \"htmlContent\"\n"
                + "    },\n"
                + "    {\n"
                + "      \"type\": \"email\",\n"
                + "      \"emailAddress\": \"emailAddress\",\n"
                + "      \"subject\": \"subject\",\n"
                + "      \"htmlContent\": \"htmlContent\"\n"
                + "    }\n"
                + "  ],\n"
                + "  \"optionalMapOfEnums\": {\n"
                + "    \"optionalMapOfEnums\": \"ADMIN\"\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testGetComplexProfile() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"nullableRole\":\"ADMIN\",\"optionalRole\":\"ADMIN\",\"optionalNullableRole\":\"ADMIN\",\"nullableStatus\":\"active\",\"optionalStatus\":\"active\",\"optionalNullableStatus\":\"active\",\"nullableNotification\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"optionalNotification\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"optionalNullableNotification\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"nullableSearchResult\":{\"type\":\"user\",\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"optionalSearchResult\":{\"type\":\"user\",\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"nullableArray\":[\"nullableArray\",\"nullableArray\"],\"optionalArray\":[\"optionalArray\",\"optionalArray\"],\"optionalNullableArray\":[\"optionalNullableArray\",\"optionalNullableArray\"],\"nullableListOfNullables\":[\"nullableListOfNullables\",\"nullableListOfNullables\"],\"nullableMapOfNullables\":{\"nullableMapOfNullables\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"nullableListOfUnions\":[{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"}],\"optionalMapOfEnums\":{\"optionalMapOfEnums\":\"ADMIN\"}}"));
        ComplexProfile response = client.nullableOptional().getComplexProfile("profileId");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"id\": \"id\",\n"
                + "  \"nullableRole\": \"ADMIN\",\n"
                + "  \"optionalRole\": \"ADMIN\",\n"
                + "  \"optionalNullableRole\": \"ADMIN\",\n"
                + "  \"nullableStatus\": \"active\",\n"
                + "  \"optionalStatus\": \"active\",\n"
                + "  \"optionalNullableStatus\": \"active\",\n"
                + "  \"nullableNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"optionalNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"optionalNullableNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"nullableSearchResult\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"optionalSearchResult\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableArray\": [\n"
                + "    \"nullableArray\",\n"
                + "    \"nullableArray\"\n"
                + "  ],\n"
                + "  \"optionalArray\": [\n"
                + "    \"optionalArray\",\n"
                + "    \"optionalArray\"\n"
                + "  ],\n"
                + "  \"optionalNullableArray\": [\n"
                + "    \"optionalNullableArray\",\n"
                + "    \"optionalNullableArray\"\n"
                + "  ],\n"
                + "  \"nullableListOfNullables\": [\n"
                + "    \"nullableListOfNullables\",\n"
                + "    \"nullableListOfNullables\"\n"
                + "  ],\n"
                + "  \"nullableMapOfNullables\": {\n"
                + "    \"nullableMapOfNullables\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableListOfUnions\": [\n"
                + "    {\n"
                + "      \"type\": \"email\",\n"
                + "      \"emailAddress\": \"emailAddress\",\n"
                + "      \"subject\": \"subject\",\n"
                + "      \"htmlContent\": \"htmlContent\"\n"
                + "    },\n"
                + "    {\n"
                + "      \"type\": \"email\",\n"
                + "      \"emailAddress\": \"emailAddress\",\n"
                + "      \"subject\": \"subject\",\n"
                + "      \"htmlContent\": \"htmlContent\"\n"
                + "    }\n"
                + "  ],\n"
                + "  \"optionalMapOfEnums\": {\n"
                + "    \"optionalMapOfEnums\": \"ADMIN\"\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testUpdateComplexProfile() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"nullableRole\":\"ADMIN\",\"optionalRole\":\"ADMIN\",\"optionalNullableRole\":\"ADMIN\",\"nullableStatus\":\"active\",\"optionalStatus\":\"active\",\"optionalNullableStatus\":\"active\",\"nullableNotification\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"optionalNotification\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"optionalNullableNotification\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"nullableSearchResult\":{\"type\":\"user\",\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"optionalSearchResult\":{\"type\":\"user\",\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"nullableArray\":[\"nullableArray\",\"nullableArray\"],\"optionalArray\":[\"optionalArray\",\"optionalArray\"],\"optionalNullableArray\":[\"optionalNullableArray\",\"optionalNullableArray\"],\"nullableListOfNullables\":[\"nullableListOfNullables\",\"nullableListOfNullables\"],\"nullableMapOfNullables\":{\"nullableMapOfNullables\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"nullableListOfUnions\":[{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"}],\"optionalMapOfEnums\":{\"optionalMapOfEnums\":\"ADMIN\"}}"));
        ComplexProfile response = client.nullableOptional()
                .updateComplexProfile(
                        "profileId",
                        UpdateComplexProfileRequest.builder()
                                .nullableRole(UserRole.ADMIN)
                                .nullableStatus(UserStatus.ACTIVE)
                                .nullableNotification(NotificationMethod.email(EmailNotification.builder()
                                        .emailAddress("emailAddress")
                                        .subject("subject")
                                        .htmlContent("htmlContent")
                                        .build()))
                                .nullableSearchResult(SearchResult.user(UserResponse.builder()
                                        .id("id")
                                        .username("username")
                                        .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                        .email("email")
                                        .phone("phone")
                                        .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                        .address(Address.builder()
                                                .street("street")
                                                .zipCode("zipCode")
                                                .city("city")
                                                .state("state")
                                                .country("country")
                                                .buildingId("buildingId")
                                                .tenantId("tenantId")
                                                .build())
                                        .build()))
                                .nullableArray(Optional.of(Arrays.asList("nullableArray", "nullableArray")))
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PATCH", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"nullableRole\": \"ADMIN\",\n"
                + "  \"nullableStatus\": \"active\",\n"
                + "  \"nullableNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"nullableSearchResult\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableArray\": [\n"
                + "    \"nullableArray\",\n"
                + "    \"nullableArray\"\n"
                + "  ]\n"
                + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
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
                + "  \"id\": \"id\",\n"
                + "  \"nullableRole\": \"ADMIN\",\n"
                + "  \"optionalRole\": \"ADMIN\",\n"
                + "  \"optionalNullableRole\": \"ADMIN\",\n"
                + "  \"nullableStatus\": \"active\",\n"
                + "  \"optionalStatus\": \"active\",\n"
                + "  \"optionalNullableStatus\": \"active\",\n"
                + "  \"nullableNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"optionalNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"optionalNullableNotification\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"nullableSearchResult\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"optionalSearchResult\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableArray\": [\n"
                + "    \"nullableArray\",\n"
                + "    \"nullableArray\"\n"
                + "  ],\n"
                + "  \"optionalArray\": [\n"
                + "    \"optionalArray\",\n"
                + "    \"optionalArray\"\n"
                + "  ],\n"
                + "  \"optionalNullableArray\": [\n"
                + "    \"optionalNullableArray\",\n"
                + "    \"optionalNullableArray\"\n"
                + "  ],\n"
                + "  \"nullableListOfNullables\": [\n"
                + "    \"nullableListOfNullables\",\n"
                + "    \"nullableListOfNullables\"\n"
                + "  ],\n"
                + "  \"nullableMapOfNullables\": {\n"
                + "    \"nullableMapOfNullables\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableListOfUnions\": [\n"
                + "    {\n"
                + "      \"type\": \"email\",\n"
                + "      \"emailAddress\": \"emailAddress\",\n"
                + "      \"subject\": \"subject\",\n"
                + "      \"htmlContent\": \"htmlContent\"\n"
                + "    },\n"
                + "    {\n"
                + "      \"type\": \"email\",\n"
                + "      \"emailAddress\": \"emailAddress\",\n"
                + "      \"subject\": \"subject\",\n"
                + "      \"htmlContent\": \"htmlContent\"\n"
                + "    }\n"
                + "  ],\n"
                + "  \"optionalMapOfEnums\": {\n"
                + "    \"optionalMapOfEnums\": \"ADMIN\"\n"
                + "  }\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testTestDeserialization() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"echo\":{\"requiredString\":\"requiredString\",\"nullableString\":\"nullableString\",\"optionalString\":\"optionalString\",\"optionalNullableString\":\"optionalNullableString\",\"nullableEnum\":\"ADMIN\",\"optionalEnum\":\"active\",\"nullableUnion\":{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"},\"optionalUnion\":{\"type\":\"user\",\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},\"nullableList\":[\"nullableList\",\"nullableList\"],\"nullableMap\":{\"nullableMap\":1},\"nullableObject\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"},\"optionalObject\":{\"id\":\"id\",\"name\":\"name\",\"domain\":\"domain\",\"employeeCount\":1}},\"processedAt\":\"2024-01-15T09:30:00Z\",\"nullCount\":1,\"presentFieldsCount\":1}"));
        DeserializationTestResponse response = client.nullableOptional()
                .testDeserialization(DeserializationTestRequest.builder()
                        .requiredString("requiredString")
                        .nullableString("nullableString")
                        .optionalString("optionalString")
                        .optionalNullableString("optionalNullableString")
                        .nullableEnum(UserRole.ADMIN)
                        .optionalEnum(UserStatus.ACTIVE)
                        .nullableUnion(NotificationMethod.email(EmailNotification.builder()
                                .emailAddress("emailAddress")
                                .subject("subject")
                                .htmlContent("htmlContent")
                                .build()))
                        .optionalUnion(SearchResult.user(UserResponse.builder()
                                .id("id")
                                .username("username")
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .email("email")
                                .phone("phone")
                                .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .address(Address.builder()
                                        .street("street")
                                        .zipCode("zipCode")
                                        .city("city")
                                        .state("state")
                                        .country("country")
                                        .buildingId("buildingId")
                                        .tenantId("tenantId")
                                        .build())
                                .build()))
                        .nullableList(Optional.of(Arrays.asList("nullableList", "nullableList")))
                        .nullableMap(new HashMap<String, Integer>() {
                            {
                                put("nullableMap", 1);
                            }
                        })
                        .nullableObject(Address.builder()
                                .street("street")
                                .zipCode("zipCode")
                                .city("city")
                                .state("state")
                                .country("country")
                                .buildingId("buildingId")
                                .tenantId("tenantId")
                                .build())
                        .optionalObject(Organization.builder()
                                .id("id")
                                .name("name")
                                .domain("domain")
                                .employeeCount(1)
                                .build())
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"requiredString\": \"requiredString\",\n"
                + "  \"nullableString\": \"nullableString\",\n"
                + "  \"optionalString\": \"optionalString\",\n"
                + "  \"optionalNullableString\": \"optionalNullableString\",\n"
                + "  \"nullableEnum\": \"ADMIN\",\n"
                + "  \"optionalEnum\": \"active\",\n"
                + "  \"nullableUnion\": {\n"
                + "    \"type\": \"email\",\n"
                + "    \"emailAddress\": \"emailAddress\",\n"
                + "    \"subject\": \"subject\",\n"
                + "    \"htmlContent\": \"htmlContent\"\n"
                + "  },\n"
                + "  \"optionalUnion\": {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"nullableList\": [\n"
                + "    \"nullableList\",\n"
                + "    \"nullableList\"\n"
                + "  ],\n"
                + "  \"nullableMap\": {\n"
                + "    \"nullableMap\": 1\n"
                + "  },\n"
                + "  \"nullableObject\": {\n"
                + "    \"street\": \"street\",\n"
                + "    \"city\": \"city\",\n"
                + "    \"state\": \"state\",\n"
                + "    \"zipCode\": \"zipCode\",\n"
                + "    \"country\": \"country\",\n"
                + "    \"buildingId\": \"buildingId\",\n"
                + "    \"tenantId\": \"tenantId\"\n"
                + "  },\n"
                + "  \"optionalObject\": {\n"
                + "    \"id\": \"id\",\n"
                + "    \"name\": \"name\",\n"
                + "    \"domain\": \"domain\",\n"
                + "    \"employeeCount\": 1\n"
                + "  }\n"
                + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
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
                + "  \"echo\": {\n"
                + "    \"requiredString\": \"requiredString\",\n"
                + "    \"nullableString\": \"nullableString\",\n"
                + "    \"optionalString\": \"optionalString\",\n"
                + "    \"optionalNullableString\": \"optionalNullableString\",\n"
                + "    \"nullableEnum\": \"ADMIN\",\n"
                + "    \"optionalEnum\": \"active\",\n"
                + "    \"nullableUnion\": {\n"
                + "      \"type\": \"email\",\n"
                + "      \"emailAddress\": \"emailAddress\",\n"
                + "      \"subject\": \"subject\",\n"
                + "      \"htmlContent\": \"htmlContent\"\n"
                + "    },\n"
                + "    \"optionalUnion\": {\n"
                + "      \"type\": \"user\",\n"
                + "      \"id\": \"id\",\n"
                + "      \"username\": \"username\",\n"
                + "      \"email\": \"email\",\n"
                + "      \"phone\": \"phone\",\n"
                + "      \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"address\": {\n"
                + "        \"street\": \"street\",\n"
                + "        \"city\": \"city\",\n"
                + "        \"state\": \"state\",\n"
                + "        \"zipCode\": \"zipCode\",\n"
                + "        \"country\": \"country\",\n"
                + "        \"buildingId\": \"buildingId\",\n"
                + "        \"tenantId\": \"tenantId\"\n"
                + "      }\n"
                + "    },\n"
                + "    \"nullableList\": [\n"
                + "      \"nullableList\",\n"
                + "      \"nullableList\"\n"
                + "    ],\n"
                + "    \"nullableMap\": {\n"
                + "      \"nullableMap\": 1\n"
                + "    },\n"
                + "    \"nullableObject\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    },\n"
                + "    \"optionalObject\": {\n"
                + "      \"id\": \"id\",\n"
                + "      \"name\": \"name\",\n"
                + "      \"domain\": \"domain\",\n"
                + "      \"employeeCount\": 1\n"
                + "    }\n"
                + "  },\n"
                + "  \"processedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"nullCount\": 1,\n"
                + "  \"presentFieldsCount\": 1\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testFilterByRole() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "[{\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},{\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}}]"));
        List<UserResponse> response = client.nullableOptional()
                .filterByRole(FilterByRoleRequest.builder()
                        .role(UserRole.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .secondaryRole(UserRole.ADMIN)
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "[\n"
                + "  {\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  {\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  }\n"
                + "]";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testGetNotificationSettings() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"type\":\"email\",\"emailAddress\":\"emailAddress\",\"subject\":\"subject\",\"htmlContent\":\"htmlContent\"}"));
        Optional<NotificationMethod> response = client.nullableOptional().getNotificationSettings("userId");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"type\": \"email\",\n"
                + "  \"emailAddress\": \"emailAddress\",\n"
                + "  \"subject\": \"subject\",\n"
                + "  \"htmlContent\": \"htmlContent\"\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testUpdateTags() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("[\"string\",\"string\"]"));
        List<String> response = client.nullableOptional()
                .updateTags(
                        "userId",
                        UpdateTagsRequest.builder()
                                .tags(Optional.of(Arrays.asList("tags", "tags")))
                                .categories(Optional.of(Arrays.asList("categories", "categories")))
                                .labels(Optional.of(Arrays.asList("labels", "labels")))
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PUT", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"tags\": [\n"
                + "    \"tags\",\n"
                + "    \"tags\"\n"
                + "  ],\n"
                + "  \"categories\": [\n"
                + "    \"categories\",\n"
                + "    \"categories\"\n"
                + "  ],\n"
                + "  \"labels\": [\n"
                + "    \"labels\",\n"
                + "    \"labels\"\n"
                + "  ]\n"
                + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
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
        String expectedResponseBody = "" + "[\n" + "  \"string\",\n" + "  \"string\"\n" + "]";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
    public void testGetSearchResults() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "[{\"type\":\"user\",\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}},{\"type\":\"user\",\"id\":\"id\",\"username\":\"username\",\"email\":\"email\",\"phone\":\"phone\",\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"address\":{\"street\":\"street\",\"city\":\"city\",\"state\":\"state\",\"zipCode\":\"zipCode\",\"country\":\"country\",\"buildingId\":\"buildingId\",\"tenantId\":\"tenantId\"}}]"));
        Optional<List<SearchResult>> response = client.nullableOptional()
                .getSearchResults(SearchRequest.builder()
                        .query("query")
                        .filters(new HashMap<String, Optional<String>>() {
                            {
                                put("filters", Optional.of("filters"));
                            }
                        })
                        .includeTypes(Optional.of(Arrays.asList("includeTypes", "includeTypes")))
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"query\": \"query\",\n"
                + "  \"filters\": {\n"
                + "    \"filters\": \"filters\"\n"
                + "  },\n"
                + "  \"includeTypes\": [\n"
                + "    \"includeTypes\",\n"
                + "    \"includeTypes\"\n"
                + "  ]\n"
                + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
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
                + "[\n"
                + "  {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  },\n"
                + "  {\n"
                + "    \"type\": \"user\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"username\": \"username\",\n"
                + "    \"email\": \"email\",\n"
                + "    \"phone\": \"phone\",\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"address\": {\n"
                + "      \"street\": \"street\",\n"
                + "      \"city\": \"city\",\n"
                + "      \"state\": \"state\",\n"
                + "      \"zipCode\": \"zipCode\",\n"
                + "      \"country\": \"country\",\n"
                + "      \"buildingId\": \"buildingId\",\n"
                + "      \"tenantId\": \"tenantId\"\n"
                + "    }\n"
                + "  }\n"
                + "]";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(
                expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
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
}
