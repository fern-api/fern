package com.seed.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.api.core.ObjectMappers;
import com.seed.api.resources.service.requests.CreateUserRequest;
import com.seed.api.resources.service.requests.ServiceDeleteUserRequest;
import com.seed.api.resources.service.requests.ServiceGetClientRequest;
import com.seed.api.resources.service.requests.ServiceGetConnectionRequest;
import com.seed.api.resources.service.requests.ServiceGetResourceRequest;
import com.seed.api.resources.service.requests.ServiceGetUserByIdRequest;
import com.seed.api.resources.service.requests.ServiceListClientsRequest;
import com.seed.api.resources.service.requests.ServiceListConnectionsRequest;
import com.seed.api.resources.service.requests.ServiceListResourcesRequest;
import com.seed.api.resources.service.requests.ServiceListUsersRequest;
import com.seed.api.resources.service.requests.ServiceSearchResourcesRequest;
import com.seed.api.resources.service.requests.UpdateUserRequest;
import com.seed.api.types.Client;
import com.seed.api.types.Connection;
import com.seed.api.types.PaginatedClientResponse;
import com.seed.api.types.PaginatedUserResponse;
import com.seed.api.types.Resource;
import com.seed.api.types.SearchResponse;
import com.seed.api.types.User;
import java.util.List;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ServiceWireTest {
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
    public void testListresources() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "[{\"id\":\"id\",\"name\":\"name\",\"description\":\"description\",\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"metadata\":{\"key\":\"value\"}}]"));
        List<Resource> response = client.service()
                .listresources(ServiceListResourcesRequest.builder()
                        .page(1)
                        .perPage(1)
                        .sort("sort")
                        .order("order")
                        .includeTotals(true)
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
                + "    \"name\": \"name\",\n"
                + "    \"description\": \"description\",\n"
                + "    \"created_at\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updated_at\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  }\n"
                + "]";
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
    public void testGetresource() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"name\":\"name\",\"description\":\"description\",\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"metadata\":{\"key\":\"value\"}}"));
        Resource response = client.service()
                .getresource(
                        "resourceId",
                        ServiceGetResourceRequest.builder()
                                .includeMetadata(true)
                                .format("format")
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"id\": \"id\",\n"
                + "  \"name\": \"name\",\n"
                + "  \"description\": \"description\",\n"
                + "  \"created_at\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"updated_at\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"metadata\": {\n"
                + "    \"key\": \"value\"\n"
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
    public void testSearchresources() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"results\":[{\"id\":\"id\",\"name\":\"name\",\"description\":\"description\",\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"metadata\":{\"key\":\"value\"}}],\"total\":1,\"next_offset\":1}"));
        SearchResponse response = client.service()
                .searchresources(ServiceSearchResourcesRequest.builder()
                        .limit(1)
                        .offset(1)
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
                + "  \"results\": [\n"
                + "    {\n"
                + "      \"id\": \"id\",\n"
                + "      \"name\": \"name\",\n"
                + "      \"description\": \"description\",\n"
                + "      \"created_at\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"updated_at\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"metadata\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
                + "    }\n"
                + "  ],\n"
                + "  \"total\": 1,\n"
                + "  \"next_offset\": 1\n"
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
    public void testListusers() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"users\":[{\"user_id\":\"user_id\",\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"identities\":[{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true}],\"app_metadata\":{\"key\":\"value\"},\"user_metadata\":{\"key\":\"value\"},\"picture\":\"picture\",\"name\":\"name\",\"nickname\":\"nickname\",\"multifactor\":[\"multifactor\"],\"last_ip\":\"last_ip\",\"last_login\":\"2024-01-15T09:30:00Z\",\"logins_count\":1,\"blocked\":true,\"given_name\":\"given_name\",\"family_name\":\"family_name\"}],\"start\":1,\"limit\":1,\"length\":1,\"total\":1}"));
        PaginatedUserResponse response =
                client.service().listusers(ServiceListUsersRequest.builder().build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"users\": [\n"
                + "    {\n"
                + "      \"user_id\": \"user_id\",\n"
                + "      \"email\": \"email\",\n"
                + "      \"email_verified\": true,\n"
                + "      \"username\": \"username\",\n"
                + "      \"phone_number\": \"phone_number\",\n"
                + "      \"phone_verified\": true,\n"
                + "      \"created_at\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"updated_at\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"identities\": [\n"
                + "        {\n"
                + "          \"connection\": \"connection\",\n"
                + "          \"user_id\": \"user_id\",\n"
                + "          \"provider\": \"provider\",\n"
                + "          \"is_social\": true\n"
                + "        }\n"
                + "      ],\n"
                + "      \"app_metadata\": {\n"
                + "        \"key\": \"value\"\n"
                + "      },\n"
                + "      \"user_metadata\": {\n"
                + "        \"key\": \"value\"\n"
                + "      },\n"
                + "      \"picture\": \"picture\",\n"
                + "      \"name\": \"name\",\n"
                + "      \"nickname\": \"nickname\",\n"
                + "      \"multifactor\": [\n"
                + "        \"multifactor\"\n"
                + "      ],\n"
                + "      \"last_ip\": \"last_ip\",\n"
                + "      \"last_login\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"logins_count\": 1,\n"
                + "      \"blocked\": true,\n"
                + "      \"given_name\": \"given_name\",\n"
                + "      \"family_name\": \"family_name\"\n"
                + "    }\n"
                + "  ],\n"
                + "  \"start\": 1,\n"
                + "  \"limit\": 1,\n"
                + "  \"length\": 1,\n"
                + "  \"total\": 1\n"
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
    public void testCreateuser() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"user_id\":\"user_id\",\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"identities\":[{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1}],\"app_metadata\":{\"key\":\"value\"},\"user_metadata\":{\"key\":\"value\"},\"picture\":\"picture\",\"name\":\"name\",\"nickname\":\"nickname\",\"multifactor\":[\"multifactor\"],\"last_ip\":\"last_ip\",\"last_login\":\"2024-01-15T09:30:00Z\",\"logins_count\":1,\"blocked\":true,\"given_name\":\"given_name\",\"family_name\":\"family_name\"}"));
        User response = client.service()
                .createuser(CreateUserRequest.builder()
                        .email("email")
                        .connection("connection")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody =
                "" + "{\n" + "  \"email\": \"email\",\n" + "  \"connection\": \"connection\"\n" + "}";
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
                + "  \"user_id\": \"user_id\",\n"
                + "  \"email\": \"email\",\n"
                + "  \"email_verified\": true,\n"
                + "  \"username\": \"username\",\n"
                + "  \"phone_number\": \"phone_number\",\n"
                + "  \"phone_verified\": true,\n"
                + "  \"created_at\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"updated_at\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"identities\": [\n"
                + "    {\n"
                + "      \"connection\": \"connection\",\n"
                + "      \"user_id\": \"user_id\",\n"
                + "      \"provider\": \"provider\",\n"
                + "      \"is_social\": true,\n"
                + "      \"access_token\": \"access_token\",\n"
                + "      \"expires_in\": 1\n"
                + "    }\n"
                + "  ],\n"
                + "  \"app_metadata\": {\n"
                + "    \"key\": \"value\"\n"
                + "  },\n"
                + "  \"user_metadata\": {\n"
                + "    \"key\": \"value\"\n"
                + "  },\n"
                + "  \"picture\": \"picture\",\n"
                + "  \"name\": \"name\",\n"
                + "  \"nickname\": \"nickname\",\n"
                + "  \"multifactor\": [\n"
                + "    \"multifactor\"\n"
                + "  ],\n"
                + "  \"last_ip\": \"last_ip\",\n"
                + "  \"last_login\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"logins_count\": 1,\n"
                + "  \"blocked\": true,\n"
                + "  \"given_name\": \"given_name\",\n"
                + "  \"family_name\": \"family_name\"\n"
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
    public void testGetuserbyid() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"user_id\":\"user_id\",\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"identities\":[{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1}],\"app_metadata\":{\"key\":\"value\"},\"user_metadata\":{\"key\":\"value\"},\"picture\":\"picture\",\"name\":\"name\",\"nickname\":\"nickname\",\"multifactor\":[\"multifactor\"],\"last_ip\":\"last_ip\",\"last_login\":\"2024-01-15T09:30:00Z\",\"logins_count\":1,\"blocked\":true,\"given_name\":\"given_name\",\"family_name\":\"family_name\"}"));
        User response = client.service()
                .getuserbyid("userId", ServiceGetUserByIdRequest.builder().build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"user_id\": \"user_id\",\n"
                + "  \"email\": \"email\",\n"
                + "  \"email_verified\": true,\n"
                + "  \"username\": \"username\",\n"
                + "  \"phone_number\": \"phone_number\",\n"
                + "  \"phone_verified\": true,\n"
                + "  \"created_at\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"updated_at\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"identities\": [\n"
                + "    {\n"
                + "      \"connection\": \"connection\",\n"
                + "      \"user_id\": \"user_id\",\n"
                + "      \"provider\": \"provider\",\n"
                + "      \"is_social\": true,\n"
                + "      \"access_token\": \"access_token\",\n"
                + "      \"expires_in\": 1\n"
                + "    }\n"
                + "  ],\n"
                + "  \"app_metadata\": {\n"
                + "    \"key\": \"value\"\n"
                + "  },\n"
                + "  \"user_metadata\": {\n"
                + "    \"key\": \"value\"\n"
                + "  },\n"
                + "  \"picture\": \"picture\",\n"
                + "  \"name\": \"name\",\n"
                + "  \"nickname\": \"nickname\",\n"
                + "  \"multifactor\": [\n"
                + "    \"multifactor\"\n"
                + "  ],\n"
                + "  \"last_ip\": \"last_ip\",\n"
                + "  \"last_login\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"logins_count\": 1,\n"
                + "  \"blocked\": true,\n"
                + "  \"given_name\": \"given_name\",\n"
                + "  \"family_name\": \"family_name\"\n"
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
    public void testDeleteuser() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.service().deleteuser("userId", ServiceDeleteUserRequest.builder().build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("DELETE", request.getMethod());
    }

    @Test
    public void testUpdateuser() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"user_id\":\"user_id\",\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"identities\":[{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1}],\"app_metadata\":{\"key\":\"value\"},\"user_metadata\":{\"key\":\"value\"},\"picture\":\"picture\",\"name\":\"name\",\"nickname\":\"nickname\",\"multifactor\":[\"multifactor\"],\"last_ip\":\"last_ip\",\"last_login\":\"2024-01-15T09:30:00Z\",\"logins_count\":1,\"blocked\":true,\"given_name\":\"given_name\",\"family_name\":\"family_name\"}"));
        User response = client.service()
                .updateuser("userId", UpdateUserRequest.builder().build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PATCH", request.getMethod());
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
                + "  \"user_id\": \"user_id\",\n"
                + "  \"email\": \"email\",\n"
                + "  \"email_verified\": true,\n"
                + "  \"username\": \"username\",\n"
                + "  \"phone_number\": \"phone_number\",\n"
                + "  \"phone_verified\": true,\n"
                + "  \"created_at\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"updated_at\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"identities\": [\n"
                + "    {\n"
                + "      \"connection\": \"connection\",\n"
                + "      \"user_id\": \"user_id\",\n"
                + "      \"provider\": \"provider\",\n"
                + "      \"is_social\": true,\n"
                + "      \"access_token\": \"access_token\",\n"
                + "      \"expires_in\": 1\n"
                + "    }\n"
                + "  ],\n"
                + "  \"app_metadata\": {\n"
                + "    \"key\": \"value\"\n"
                + "  },\n"
                + "  \"user_metadata\": {\n"
                + "    \"key\": \"value\"\n"
                + "  },\n"
                + "  \"picture\": \"picture\",\n"
                + "  \"name\": \"name\",\n"
                + "  \"nickname\": \"nickname\",\n"
                + "  \"multifactor\": [\n"
                + "    \"multifactor\"\n"
                + "  ],\n"
                + "  \"last_ip\": \"last_ip\",\n"
                + "  \"last_login\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"logins_count\": 1,\n"
                + "  \"blocked\": true,\n"
                + "  \"given_name\": \"given_name\",\n"
                + "  \"family_name\": \"family_name\"\n"
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
    public void testListconnections() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "[{\"id\":\"id\",\"name\":\"name\",\"display_name\":\"display_name\",\"strategy\":\"strategy\",\"options\":{\"key\":\"value\"},\"enabled_clients\":[\"enabled_clients\"],\"realms\":[\"realms\"],\"is_domain_connection\":true,\"metadata\":{\"key\":\"value\"}}]"));
        List<Connection> response = client.service()
                .listconnections(ServiceListConnectionsRequest.builder().build());
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
                + "    \"name\": \"name\",\n"
                + "    \"display_name\": \"display_name\",\n"
                + "    \"strategy\": \"strategy\",\n"
                + "    \"options\": {\n"
                + "      \"key\": \"value\"\n"
                + "    },\n"
                + "    \"enabled_clients\": [\n"
                + "      \"enabled_clients\"\n"
                + "    ],\n"
                + "    \"realms\": [\n"
                + "      \"realms\"\n"
                + "    ],\n"
                + "    \"is_domain_connection\": true,\n"
                + "    \"metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  }\n"
                + "]";
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
    public void testGetconnection() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"name\":\"name\",\"display_name\":\"display_name\",\"strategy\":\"strategy\",\"options\":{\"key\":\"value\"},\"enabled_clients\":[\"enabled_clients\"],\"realms\":[\"realms\"],\"is_domain_connection\":true,\"metadata\":{\"key\":\"value\"}}"));
        Connection response = client.service()
                .getconnection(
                        "connectionId", ServiceGetConnectionRequest.builder().build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"id\": \"id\",\n"
                + "  \"name\": \"name\",\n"
                + "  \"display_name\": \"display_name\",\n"
                + "  \"strategy\": \"strategy\",\n"
                + "  \"options\": {\n"
                + "    \"key\": \"value\"\n"
                + "  },\n"
                + "  \"enabled_clients\": [\n"
                + "    \"enabled_clients\"\n"
                + "  ],\n"
                + "  \"realms\": [\n"
                + "    \"realms\"\n"
                + "  ],\n"
                + "  \"is_domain_connection\": true,\n"
                + "  \"metadata\": {\n"
                + "    \"key\": \"value\"\n"
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
    public void testListclients() throws Exception {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody(TestResources.loadResource("/wire-tests/ServiceWireTest_testListclients_response.json")));
        PaginatedClientResponse response =
                client.service().listclients(ServiceListClientsRequest.builder().build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody =
                TestResources.loadResource("/wire-tests/ServiceWireTest_testListclients_response.json");
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
    public void testGetclient() throws Exception {
        server.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody(TestResources.loadResource("/wire-tests/ServiceWireTest_testGetclient_response.json")));
        Client response = client.service()
                .getclient("clientId", ServiceGetClientRequest.builder().build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody =
                TestResources.loadResource("/wire-tests/ServiceWireTest_testGetclient_response.json");
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
