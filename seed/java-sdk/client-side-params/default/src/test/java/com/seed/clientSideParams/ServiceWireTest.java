package com.seed.clientSideParams;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.clientSideParams.core.ObjectMappers;
import com.seed.clientSideParams.resources.service.requests.GetClientRequest;
import com.seed.clientSideParams.resources.service.requests.GetConnectionRequest;
import com.seed.clientSideParams.resources.service.requests.GetResourceRequest;
import com.seed.clientSideParams.resources.service.requests.GetUserRequest;
import com.seed.clientSideParams.resources.service.requests.ListClientsRequest;
import com.seed.clientSideParams.resources.service.requests.ListConnectionsRequest;
import com.seed.clientSideParams.resources.service.requests.ListResourcesRequest;
import com.seed.clientSideParams.resources.service.requests.ListUsersRequest;
import com.seed.clientSideParams.resources.service.requests.SearchResourcesRequest;
import com.seed.clientSideParams.resources.types.types.Client;
import com.seed.clientSideParams.resources.types.types.Connection;
import com.seed.clientSideParams.resources.types.types.CreateUserRequest;
import com.seed.clientSideParams.resources.types.types.PaginatedClientResponse;
import com.seed.clientSideParams.resources.types.types.PaginatedUserResponse;
import com.seed.clientSideParams.resources.types.types.Resource;
import com.seed.clientSideParams.resources.types.types.SearchResponse;
import com.seed.clientSideParams.resources.types.types.UpdateUserRequest;
import com.seed.clientSideParams.resources.types.types.User;
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

public class ServiceWireTest {
    private MockWebServer server;
    private SeedClientSideParamsClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedClientSideParamsClient.builder()
                .url(server.url("/").toString())
                .token("test-token")
                .build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testListResources() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "[{\"id\":\"id\",\"name\":\"name\",\"description\":\"description\",\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"metadata\":{\"metadata\":{\"key\":\"value\"}}},{\"id\":\"id\",\"name\":\"name\",\"description\":\"description\",\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"metadata\":{\"metadata\":{\"key\":\"value\"}}}]"));
        List<Resource> response = client.service()
                .listResources(ListResourcesRequest.builder()
                        .page(1)
                        .perPage(1)
                        .sort("created_at")
                        .order("desc")
                        .includeTotals(true)
                        .fields("fields")
                        .search("search")
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
                + "      \"metadata\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
                + "    }\n"
                + "  },\n"
                + "  {\n"
                + "    \"id\": \"id\",\n"
                + "    \"name\": \"name\",\n"
                + "    \"description\": \"description\",\n"
                + "    \"created_at\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updated_at\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"metadata\": {\n"
                + "      \"metadata\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
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
    public void testGetResource() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"name\":\"name\",\"description\":\"description\",\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"metadata\":{\"metadata\":{\"key\":\"value\"}}}"));
        Resource response = client.service()
                .getResource(
                        "resourceId",
                        GetResourceRequest.builder()
                                .includeMetadata(true)
                                .format("json")
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
                + "    \"metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
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
    public void testSearchResources() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"results\":[{\"id\":\"id\",\"name\":\"name\",\"description\":\"description\",\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"metadata\":{\"metadata\":{\"key\":\"value\"}}},{\"id\":\"id\",\"name\":\"name\",\"description\":\"description\",\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"metadata\":{\"metadata\":{\"key\":\"value\"}}}],\"total\":1,\"next_offset\":1}"));
        SearchResponse response = client.service()
                .searchResources(SearchResourcesRequest.builder()
                        .limit(1)
                        .offset(1)
                        .query("query")
                        .filters(new HashMap<String, Object>() {
                            {
                                put("filters", new HashMap<String, Object>() {
                                    {
                                        put("key", "value");
                                    }
                                });
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
                + "  \"query\": \"query\",\n"
                + "  \"filters\": {\n"
                + "    \"filters\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  }\n"
                + "}";
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
                + "        \"metadata\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      }\n"
                + "    },\n"
                + "    {\n"
                + "      \"id\": \"id\",\n"
                + "      \"name\": \"name\",\n"
                + "      \"description\": \"description\",\n"
                + "      \"created_at\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"updated_at\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"metadata\": {\n"
                + "        \"metadata\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
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
    public void testListUsers() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"users\":[{\"user_id\":\"user_id\",\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"identities\":[{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1},{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1}],\"app_metadata\":{\"app_metadata\":{\"key\":\"value\"}},\"user_metadata\":{\"user_metadata\":{\"key\":\"value\"}},\"picture\":\"picture\",\"name\":\"name\",\"nickname\":\"nickname\",\"multifactor\":[\"multifactor\",\"multifactor\"],\"last_ip\":\"last_ip\",\"last_login\":\"2024-01-15T09:30:00Z\",\"logins_count\":1,\"blocked\":true,\"given_name\":\"given_name\",\"family_name\":\"family_name\"},{\"user_id\":\"user_id\",\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"identities\":[{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1},{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1}],\"app_metadata\":{\"app_metadata\":{\"key\":\"value\"}},\"user_metadata\":{\"user_metadata\":{\"key\":\"value\"}},\"picture\":\"picture\",\"name\":\"name\",\"nickname\":\"nickname\",\"multifactor\":[\"multifactor\",\"multifactor\"],\"last_ip\":\"last_ip\",\"last_login\":\"2024-01-15T09:30:00Z\",\"logins_count\":1,\"blocked\":true,\"given_name\":\"given_name\",\"family_name\":\"family_name\"}],\"start\":1,\"limit\":1,\"length\":1,\"total\":1}"));
        PaginatedUserResponse response = client.service()
                .listUsers(ListUsersRequest.builder()
                        .page(1)
                        .perPage(1)
                        .includeTotals(true)
                        .sort("sort")
                        .connection("connection")
                        .q("q")
                        .searchEngine("search_engine")
                        .fields("fields")
                        .build());
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
                + "          \"is_social\": true,\n"
                + "          \"access_token\": \"access_token\",\n"
                + "          \"expires_in\": 1\n"
                + "        },\n"
                + "        {\n"
                + "          \"connection\": \"connection\",\n"
                + "          \"user_id\": \"user_id\",\n"
                + "          \"provider\": \"provider\",\n"
                + "          \"is_social\": true,\n"
                + "          \"access_token\": \"access_token\",\n"
                + "          \"expires_in\": 1\n"
                + "        }\n"
                + "      ],\n"
                + "      \"app_metadata\": {\n"
                + "        \"app_metadata\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"user_metadata\": {\n"
                + "        \"user_metadata\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"picture\": \"picture\",\n"
                + "      \"name\": \"name\",\n"
                + "      \"nickname\": \"nickname\",\n"
                + "      \"multifactor\": [\n"
                + "        \"multifactor\",\n"
                + "        \"multifactor\"\n"
                + "      ],\n"
                + "      \"last_ip\": \"last_ip\",\n"
                + "      \"last_login\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"logins_count\": 1,\n"
                + "      \"blocked\": true,\n"
                + "      \"given_name\": \"given_name\",\n"
                + "      \"family_name\": \"family_name\"\n"
                + "    },\n"
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
                + "          \"is_social\": true,\n"
                + "          \"access_token\": \"access_token\",\n"
                + "          \"expires_in\": 1\n"
                + "        },\n"
                + "        {\n"
                + "          \"connection\": \"connection\",\n"
                + "          \"user_id\": \"user_id\",\n"
                + "          \"provider\": \"provider\",\n"
                + "          \"is_social\": true,\n"
                + "          \"access_token\": \"access_token\",\n"
                + "          \"expires_in\": 1\n"
                + "        }\n"
                + "      ],\n"
                + "      \"app_metadata\": {\n"
                + "        \"app_metadata\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"user_metadata\": {\n"
                + "        \"user_metadata\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"picture\": \"picture\",\n"
                + "      \"name\": \"name\",\n"
                + "      \"nickname\": \"nickname\",\n"
                + "      \"multifactor\": [\n"
                + "        \"multifactor\",\n"
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
    public void testGetUserById() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"user_id\":\"user_id\",\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"identities\":[{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1},{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1}],\"app_metadata\":{\"app_metadata\":{\"key\":\"value\"}},\"user_metadata\":{\"user_metadata\":{\"key\":\"value\"}},\"picture\":\"picture\",\"name\":\"name\",\"nickname\":\"nickname\",\"multifactor\":[\"multifactor\",\"multifactor\"],\"last_ip\":\"last_ip\",\"last_login\":\"2024-01-15T09:30:00Z\",\"logins_count\":1,\"blocked\":true,\"given_name\":\"given_name\",\"family_name\":\"family_name\"}"));
        User response = client.service()
                .getUserById(
                        "userId",
                        GetUserRequest.builder()
                                .fields("fields")
                                .includeFields(true)
                                .build());
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
                + "    },\n"
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
                + "    \"app_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"user_metadata\": {\n"
                + "    \"user_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"picture\": \"picture\",\n"
                + "  \"name\": \"name\",\n"
                + "  \"nickname\": \"nickname\",\n"
                + "  \"multifactor\": [\n"
                + "    \"multifactor\",\n"
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
    public void testCreateUser() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"user_id\":\"user_id\",\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"identities\":[{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1},{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1}],\"app_metadata\":{\"app_metadata\":{\"key\":\"value\"}},\"user_metadata\":{\"user_metadata\":{\"key\":\"value\"}},\"picture\":\"picture\",\"name\":\"name\",\"nickname\":\"nickname\",\"multifactor\":[\"multifactor\",\"multifactor\"],\"last_ip\":\"last_ip\",\"last_login\":\"2024-01-15T09:30:00Z\",\"logins_count\":1,\"blocked\":true,\"given_name\":\"given_name\",\"family_name\":\"family_name\"}"));
        User response = client.service()
                .createUser(CreateUserRequest.builder()
                        .email("email")
                        .connection("connection")
                        .emailVerified(true)
                        .username("username")
                        .password("password")
                        .phoneNumber("phone_number")
                        .phoneVerified(true)
                        .userMetadata(new HashMap<String, Object>() {
                            {
                                put("user_metadata", new HashMap<String, Object>() {
                                    {
                                        put("key", "value");
                                    }
                                });
                            }
                        })
                        .appMetadata(new HashMap<String, Object>() {
                            {
                                put("app_metadata", new HashMap<String, Object>() {
                                    {
                                        put("key", "value");
                                    }
                                });
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
                + "  \"email\": \"email\",\n"
                + "  \"email_verified\": true,\n"
                + "  \"username\": \"username\",\n"
                + "  \"password\": \"password\",\n"
                + "  \"phone_number\": \"phone_number\",\n"
                + "  \"phone_verified\": true,\n"
                + "  \"user_metadata\": {\n"
                + "    \"user_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"app_metadata\": {\n"
                + "    \"app_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"connection\": \"connection\"\n"
                + "}";
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
                + "    },\n"
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
                + "    \"app_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"user_metadata\": {\n"
                + "    \"user_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"picture\": \"picture\",\n"
                + "  \"name\": \"name\",\n"
                + "  \"nickname\": \"nickname\",\n"
                + "  \"multifactor\": [\n"
                + "    \"multifactor\",\n"
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
    public void testUpdateUser() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"user_id\":\"user_id\",\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"created_at\":\"2024-01-15T09:30:00Z\",\"updated_at\":\"2024-01-15T09:30:00Z\",\"identities\":[{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1},{\"connection\":\"connection\",\"user_id\":\"user_id\",\"provider\":\"provider\",\"is_social\":true,\"access_token\":\"access_token\",\"expires_in\":1}],\"app_metadata\":{\"app_metadata\":{\"key\":\"value\"}},\"user_metadata\":{\"user_metadata\":{\"key\":\"value\"}},\"picture\":\"picture\",\"name\":\"name\",\"nickname\":\"nickname\",\"multifactor\":[\"multifactor\",\"multifactor\"],\"last_ip\":\"last_ip\",\"last_login\":\"2024-01-15T09:30:00Z\",\"logins_count\":1,\"blocked\":true,\"given_name\":\"given_name\",\"family_name\":\"family_name\"}"));
        User response = client.service()
                .updateUser(
                        "userId",
                        UpdateUserRequest.builder()
                                .email("email")
                                .emailVerified(true)
                                .username("username")
                                .phoneNumber("phone_number")
                                .phoneVerified(true)
                                .userMetadata(new HashMap<String, Object>() {
                                    {
                                        put("user_metadata", new HashMap<String, Object>() {
                                            {
                                                put("key", "value");
                                            }
                                        });
                                    }
                                })
                                .appMetadata(new HashMap<String, Object>() {
                                    {
                                        put("app_metadata", new HashMap<String, Object>() {
                                            {
                                                put("key", "value");
                                            }
                                        });
                                    }
                                })
                                .password("password")
                                .blocked(true)
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PATCH", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"email\": \"email\",\n"
                + "  \"email_verified\": true,\n"
                + "  \"username\": \"username\",\n"
                + "  \"phone_number\": \"phone_number\",\n"
                + "  \"phone_verified\": true,\n"
                + "  \"user_metadata\": {\n"
                + "    \"user_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"app_metadata\": {\n"
                + "    \"app_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"password\": \"password\",\n"
                + "  \"blocked\": true\n"
                + "}";
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
                + "    },\n"
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
                + "    \"app_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"user_metadata\": {\n"
                + "    \"user_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"picture\": \"picture\",\n"
                + "  \"name\": \"name\",\n"
                + "  \"nickname\": \"nickname\",\n"
                + "  \"multifactor\": [\n"
                + "    \"multifactor\",\n"
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
    public void testDeleteUser() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.service().deleteUser("userId");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("DELETE", request.getMethod());
    }

    @Test
    public void testListConnections() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "[{\"id\":\"id\",\"name\":\"name\",\"display_name\":\"display_name\",\"strategy\":\"strategy\",\"options\":{\"options\":{\"key\":\"value\"}},\"enabled_clients\":[\"enabled_clients\",\"enabled_clients\"],\"realms\":[\"realms\",\"realms\"],\"is_domain_connection\":true,\"metadata\":{\"metadata\":{\"key\":\"value\"}}},{\"id\":\"id\",\"name\":\"name\",\"display_name\":\"display_name\",\"strategy\":\"strategy\",\"options\":{\"options\":{\"key\":\"value\"}},\"enabled_clients\":[\"enabled_clients\",\"enabled_clients\"],\"realms\":[\"realms\",\"realms\"],\"is_domain_connection\":true,\"metadata\":{\"metadata\":{\"key\":\"value\"}}}]"));
        List<Connection> response = client.service()
                .listConnections(ListConnectionsRequest.builder()
                        .strategy("strategy")
                        .name("name")
                        .fields("fields")
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
                + "    \"display_name\": \"display_name\",\n"
                + "    \"strategy\": \"strategy\",\n"
                + "    \"options\": {\n"
                + "      \"options\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
                + "    },\n"
                + "    \"enabled_clients\": [\n"
                + "      \"enabled_clients\",\n"
                + "      \"enabled_clients\"\n"
                + "    ],\n"
                + "    \"realms\": [\n"
                + "      \"realms\",\n"
                + "      \"realms\"\n"
                + "    ],\n"
                + "    \"is_domain_connection\": true,\n"
                + "    \"metadata\": {\n"
                + "      \"metadata\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
                + "    }\n"
                + "  },\n"
                + "  {\n"
                + "    \"id\": \"id\",\n"
                + "    \"name\": \"name\",\n"
                + "    \"display_name\": \"display_name\",\n"
                + "    \"strategy\": \"strategy\",\n"
                + "    \"options\": {\n"
                + "      \"options\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
                + "    },\n"
                + "    \"enabled_clients\": [\n"
                + "      \"enabled_clients\",\n"
                + "      \"enabled_clients\"\n"
                + "    ],\n"
                + "    \"realms\": [\n"
                + "      \"realms\",\n"
                + "      \"realms\"\n"
                + "    ],\n"
                + "    \"is_domain_connection\": true,\n"
                + "    \"metadata\": {\n"
                + "      \"metadata\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
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
    public void testGetConnection() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"id\",\"name\":\"name\",\"display_name\":\"display_name\",\"strategy\":\"strategy\",\"options\":{\"options\":{\"key\":\"value\"}},\"enabled_clients\":[\"enabled_clients\",\"enabled_clients\"],\"realms\":[\"realms\",\"realms\"],\"is_domain_connection\":true,\"metadata\":{\"metadata\":{\"key\":\"value\"}}}"));
        Connection response = client.service()
                .getConnection(
                        "connectionId",
                        GetConnectionRequest.builder().fields("fields").build());
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
                + "    \"options\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"enabled_clients\": [\n"
                + "    \"enabled_clients\",\n"
                + "    \"enabled_clients\"\n"
                + "  ],\n"
                + "  \"realms\": [\n"
                + "    \"realms\",\n"
                + "    \"realms\"\n"
                + "  ],\n"
                + "  \"is_domain_connection\": true,\n"
                + "  \"metadata\": {\n"
                + "    \"metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
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
    public void testListClients() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"start\":1,\"limit\":1,\"length\":1,\"total\":1,\"clients\":[{\"client_id\":\"client_id\",\"tenant\":\"tenant\",\"name\":\"name\",\"description\":\"description\",\"global\":true,\"client_secret\":\"client_secret\",\"app_type\":\"app_type\",\"logo_uri\":\"logo_uri\",\"is_first_party\":true,\"oidc_conformant\":true,\"callbacks\":[\"callbacks\",\"callbacks\"],\"allowed_origins\":[\"allowed_origins\",\"allowed_origins\"],\"web_origins\":[\"web_origins\",\"web_origins\"],\"grant_types\":[\"grant_types\",\"grant_types\"],\"jwt_configuration\":{\"jwt_configuration\":{\"key\":\"value\"}},\"signing_keys\":[{\"signing_keys\":{\"key\":\"value\"}},{\"signing_keys\":{\"key\":\"value\"}}],\"encryption_key\":{\"encryption_key\":{\"key\":\"value\"}},\"sso\":true,\"sso_disabled\":true,\"cross_origin_auth\":true,\"cross_origin_loc\":\"cross_origin_loc\",\"custom_login_page_on\":true,\"custom_login_page\":\"custom_login_page\",\"custom_login_page_preview\":\"custom_login_page_preview\",\"form_template\":\"form_template\",\"is_heroku_app\":true,\"addons\":{\"addons\":{\"key\":\"value\"}},\"token_endpoint_auth_method\":\"token_endpoint_auth_method\",\"client_metadata\":{\"client_metadata\":{\"key\":\"value\"}},\"mobile\":{\"mobile\":{\"key\":\"value\"}}},{\"client_id\":\"client_id\",\"tenant\":\"tenant\",\"name\":\"name\",\"description\":\"description\",\"global\":true,\"client_secret\":\"client_secret\",\"app_type\":\"app_type\",\"logo_uri\":\"logo_uri\",\"is_first_party\":true,\"oidc_conformant\":true,\"callbacks\":[\"callbacks\",\"callbacks\"],\"allowed_origins\":[\"allowed_origins\",\"allowed_origins\"],\"web_origins\":[\"web_origins\",\"web_origins\"],\"grant_types\":[\"grant_types\",\"grant_types\"],\"jwt_configuration\":{\"jwt_configuration\":{\"key\":\"value\"}},\"signing_keys\":[{\"signing_keys\":{\"key\":\"value\"}},{\"signing_keys\":{\"key\":\"value\"}}],\"encryption_key\":{\"encryption_key\":{\"key\":\"value\"}},\"sso\":true,\"sso_disabled\":true,\"cross_origin_auth\":true,\"cross_origin_loc\":\"cross_origin_loc\",\"custom_login_page_on\":true,\"custom_login_page\":\"custom_login_page\",\"custom_login_page_preview\":\"custom_login_page_preview\",\"form_template\":\"form_template\",\"is_heroku_app\":true,\"addons\":{\"addons\":{\"key\":\"value\"}},\"token_endpoint_auth_method\":\"token_endpoint_auth_method\",\"client_metadata\":{\"client_metadata\":{\"key\":\"value\"}},\"mobile\":{\"mobile\":{\"key\":\"value\"}}}]}"));
        PaginatedClientResponse response = client.service()
                .listClients(ListClientsRequest.builder()
                        .fields("fields")
                        .includeFields(true)
                        .page(1)
                        .perPage(1)
                        .includeTotals(true)
                        .isGlobal(true)
                        .isFirstParty(true)
                        .appType(Optional.of(Arrays.asList("app_type", "app_type")))
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"start\": 1,\n"
                + "  \"limit\": 1,\n"
                + "  \"length\": 1,\n"
                + "  \"total\": 1,\n"
                + "  \"clients\": [\n"
                + "    {\n"
                + "      \"client_id\": \"client_id\",\n"
                + "      \"tenant\": \"tenant\",\n"
                + "      \"name\": \"name\",\n"
                + "      \"description\": \"description\",\n"
                + "      \"global\": true,\n"
                + "      \"client_secret\": \"client_secret\",\n"
                + "      \"app_type\": \"app_type\",\n"
                + "      \"logo_uri\": \"logo_uri\",\n"
                + "      \"is_first_party\": true,\n"
                + "      \"oidc_conformant\": true,\n"
                + "      \"callbacks\": [\n"
                + "        \"callbacks\",\n"
                + "        \"callbacks\"\n"
                + "      ],\n"
                + "      \"allowed_origins\": [\n"
                + "        \"allowed_origins\",\n"
                + "        \"allowed_origins\"\n"
                + "      ],\n"
                + "      \"web_origins\": [\n"
                + "        \"web_origins\",\n"
                + "        \"web_origins\"\n"
                + "      ],\n"
                + "      \"grant_types\": [\n"
                + "        \"grant_types\",\n"
                + "        \"grant_types\"\n"
                + "      ],\n"
                + "      \"jwt_configuration\": {\n"
                + "        \"jwt_configuration\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"signing_keys\": [\n"
                + "        {\n"
                + "          \"signing_keys\": {\n"
                + "            \"key\": \"value\"\n"
                + "          }\n"
                + "        },\n"
                + "        {\n"
                + "          \"signing_keys\": {\n"
                + "            \"key\": \"value\"\n"
                + "          }\n"
                + "        }\n"
                + "      ],\n"
                + "      \"encryption_key\": {\n"
                + "        \"encryption_key\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"sso\": true,\n"
                + "      \"sso_disabled\": true,\n"
                + "      \"cross_origin_auth\": true,\n"
                + "      \"cross_origin_loc\": \"cross_origin_loc\",\n"
                + "      \"custom_login_page_on\": true,\n"
                + "      \"custom_login_page\": \"custom_login_page\",\n"
                + "      \"custom_login_page_preview\": \"custom_login_page_preview\",\n"
                + "      \"form_template\": \"form_template\",\n"
                + "      \"is_heroku_app\": true,\n"
                + "      \"addons\": {\n"
                + "        \"addons\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"token_endpoint_auth_method\": \"token_endpoint_auth_method\",\n"
                + "      \"client_metadata\": {\n"
                + "        \"client_metadata\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"mobile\": {\n"
                + "        \"mobile\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      }\n"
                + "    },\n"
                + "    {\n"
                + "      \"client_id\": \"client_id\",\n"
                + "      \"tenant\": \"tenant\",\n"
                + "      \"name\": \"name\",\n"
                + "      \"description\": \"description\",\n"
                + "      \"global\": true,\n"
                + "      \"client_secret\": \"client_secret\",\n"
                + "      \"app_type\": \"app_type\",\n"
                + "      \"logo_uri\": \"logo_uri\",\n"
                + "      \"is_first_party\": true,\n"
                + "      \"oidc_conformant\": true,\n"
                + "      \"callbacks\": [\n"
                + "        \"callbacks\",\n"
                + "        \"callbacks\"\n"
                + "      ],\n"
                + "      \"allowed_origins\": [\n"
                + "        \"allowed_origins\",\n"
                + "        \"allowed_origins\"\n"
                + "      ],\n"
                + "      \"web_origins\": [\n"
                + "        \"web_origins\",\n"
                + "        \"web_origins\"\n"
                + "      ],\n"
                + "      \"grant_types\": [\n"
                + "        \"grant_types\",\n"
                + "        \"grant_types\"\n"
                + "      ],\n"
                + "      \"jwt_configuration\": {\n"
                + "        \"jwt_configuration\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"signing_keys\": [\n"
                + "        {\n"
                + "          \"signing_keys\": {\n"
                + "            \"key\": \"value\"\n"
                + "          }\n"
                + "        },\n"
                + "        {\n"
                + "          \"signing_keys\": {\n"
                + "            \"key\": \"value\"\n"
                + "          }\n"
                + "        }\n"
                + "      ],\n"
                + "      \"encryption_key\": {\n"
                + "        \"encryption_key\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"sso\": true,\n"
                + "      \"sso_disabled\": true,\n"
                + "      \"cross_origin_auth\": true,\n"
                + "      \"cross_origin_loc\": \"cross_origin_loc\",\n"
                + "      \"custom_login_page_on\": true,\n"
                + "      \"custom_login_page\": \"custom_login_page\",\n"
                + "      \"custom_login_page_preview\": \"custom_login_page_preview\",\n"
                + "      \"form_template\": \"form_template\",\n"
                + "      \"is_heroku_app\": true,\n"
                + "      \"addons\": {\n"
                + "        \"addons\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"token_endpoint_auth_method\": \"token_endpoint_auth_method\",\n"
                + "      \"client_metadata\": {\n"
                + "        \"client_metadata\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      },\n"
                + "      \"mobile\": {\n"
                + "        \"mobile\": {\n"
                + "          \"key\": \"value\"\n"
                + "        }\n"
                + "      }\n"
                + "    }\n"
                + "  ]\n"
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
    public void testGetClient() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"client_id\":\"client_id\",\"tenant\":\"tenant\",\"name\":\"name\",\"description\":\"description\",\"global\":true,\"client_secret\":\"client_secret\",\"app_type\":\"app_type\",\"logo_uri\":\"logo_uri\",\"is_first_party\":true,\"oidc_conformant\":true,\"callbacks\":[\"callbacks\",\"callbacks\"],\"allowed_origins\":[\"allowed_origins\",\"allowed_origins\"],\"web_origins\":[\"web_origins\",\"web_origins\"],\"grant_types\":[\"grant_types\",\"grant_types\"],\"jwt_configuration\":{\"jwt_configuration\":{\"key\":\"value\"}},\"signing_keys\":[{\"signing_keys\":{\"key\":\"value\"}},{\"signing_keys\":{\"key\":\"value\"}}],\"encryption_key\":{\"encryption_key\":{\"key\":\"value\"}},\"sso\":true,\"sso_disabled\":true,\"cross_origin_auth\":true,\"cross_origin_loc\":\"cross_origin_loc\",\"custom_login_page_on\":true,\"custom_login_page\":\"custom_login_page\",\"custom_login_page_preview\":\"custom_login_page_preview\",\"form_template\":\"form_template\",\"is_heroku_app\":true,\"addons\":{\"addons\":{\"key\":\"value\"}},\"token_endpoint_auth_method\":\"token_endpoint_auth_method\",\"client_metadata\":{\"client_metadata\":{\"key\":\"value\"}},\"mobile\":{\"mobile\":{\"key\":\"value\"}}}"));
        Client response = client.service()
                .getClient(
                        "clientId",
                        GetClientRequest.builder()
                                .fields("fields")
                                .includeFields(true)
                                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"client_id\": \"client_id\",\n"
                + "  \"tenant\": \"tenant\",\n"
                + "  \"name\": \"name\",\n"
                + "  \"description\": \"description\",\n"
                + "  \"global\": true,\n"
                + "  \"client_secret\": \"client_secret\",\n"
                + "  \"app_type\": \"app_type\",\n"
                + "  \"logo_uri\": \"logo_uri\",\n"
                + "  \"is_first_party\": true,\n"
                + "  \"oidc_conformant\": true,\n"
                + "  \"callbacks\": [\n"
                + "    \"callbacks\",\n"
                + "    \"callbacks\"\n"
                + "  ],\n"
                + "  \"allowed_origins\": [\n"
                + "    \"allowed_origins\",\n"
                + "    \"allowed_origins\"\n"
                + "  ],\n"
                + "  \"web_origins\": [\n"
                + "    \"web_origins\",\n"
                + "    \"web_origins\"\n"
                + "  ],\n"
                + "  \"grant_types\": [\n"
                + "    \"grant_types\",\n"
                + "    \"grant_types\"\n"
                + "  ],\n"
                + "  \"jwt_configuration\": {\n"
                + "    \"jwt_configuration\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"signing_keys\": [\n"
                + "    {\n"
                + "      \"signing_keys\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
                + "    },\n"
                + "    {\n"
                + "      \"signing_keys\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
                + "    }\n"
                + "  ],\n"
                + "  \"encryption_key\": {\n"
                + "    \"encryption_key\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"sso\": true,\n"
                + "  \"sso_disabled\": true,\n"
                + "  \"cross_origin_auth\": true,\n"
                + "  \"cross_origin_loc\": \"cross_origin_loc\",\n"
                + "  \"custom_login_page_on\": true,\n"
                + "  \"custom_login_page\": \"custom_login_page\",\n"
                + "  \"custom_login_page_preview\": \"custom_login_page_preview\",\n"
                + "  \"form_template\": \"form_template\",\n"
                + "  \"is_heroku_app\": true,\n"
                + "  \"addons\": {\n"
                + "    \"addons\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"token_endpoint_auth_method\": \"token_endpoint_auth_method\",\n"
                + "  \"client_metadata\": {\n"
                + "    \"client_metadata\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"mobile\": {\n"
                + "    \"mobile\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
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

    /**
     * Compares two JsonNodes with numeric equivalence.
     */
    private boolean jsonEquals(JsonNode a, JsonNode b) {
        if (a.equals(b)) return true;
        if (a.isNumber() && b.isNumber()) return Math.abs(a.doubleValue() - b.doubleValue()) < 1e-10;
        if (a.isObject() && b.isObject()) {
            if (a.size() != b.size()) return false;
            java.util.Iterator<java.util.Map.Entry<String, JsonNode>> iter = a.fields();
            while (iter.hasNext()) {
                java.util.Map.Entry<String, JsonNode> entry = iter.next();
                if (!jsonEquals(entry.getValue(), b.get(entry.getKey()))) return false;
            }
            return true;
        }
        if (a.isArray() && b.isArray()) {
            if (a.size() != b.size()) return false;
            for (int i = 0; i < a.size(); i++) {
                if (!jsonEquals(a.get(i), b.get(i))) return false;
            }
            return true;
        }
        return false;
    }
}
