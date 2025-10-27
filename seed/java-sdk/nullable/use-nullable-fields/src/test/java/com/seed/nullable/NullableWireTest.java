package com.seed.nullable;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.nullable.core.ObjectMappers;
import com.seed.nullable.resources.nullable.requests.CreateUserRequest;
import com.seed.nullable.resources.nullable.requests.DeleteUserRequest;
import com.seed.nullable.resources.nullable.requests.GetUsersRequest;
import com.seed.nullable.resources.nullable.types.Metadata;
import com.seed.nullable.resources.nullable.types.Status;
import com.seed.nullable.resources.nullable.types.User;
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

public class NullableWireTest {
    private MockWebServer server;
    private SeedNullableClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedNullableClient.builder().url(server.url("/").toString()).build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testGetUsers() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "[{\"name\":\"name\",\"id\":\"id\",\"tags\":[\"tags\",\"tags\"],\"metadata\":{\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"avatar\":\"avatar\",\"activated\":true,\"status\":{\"type\":\"active\"},\"values\":{\"values\":\"values\"}},\"email\":\"email\",\"favorite-number\":1,\"numbers\":[1,1],\"strings\":{\"strings\":{\"key\":\"value\"}}},{\"name\":\"name\",\"id\":\"id\",\"tags\":[\"tags\",\"tags\"],\"metadata\":{\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"avatar\":\"avatar\",\"activated\":true,\"status\":{\"type\":\"active\"},\"values\":{\"values\":\"values\"}},\"email\":\"email\",\"favorite-number\":1,\"numbers\":[1,1],\"strings\":{\"strings\":{\"key\":\"value\"}}}]"));
        List<User> response = client.nullable()
                .getUsers(GetUsersRequest.builder()
                        .usernames(Arrays.asList(Optional.of("usernames")))
                        .activated(Arrays.asList(Optional.of(true)))
                        .tags(Arrays.asList("tags"))
                        .avatar("avatar")
                        .extra(true)
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
                + "    \"name\": \"name\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"tags\": [\n"
                + "      \"tags\",\n"
                + "      \"tags\"\n"
                + "    ],\n"
                + "    \"metadata\": {\n"
                + "      \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"avatar\": \"avatar\",\n"
                + "      \"activated\": true,\n"
                + "      \"status\": {\n"
                + "        \"type\": \"active\"\n"
                + "      },\n"
                + "      \"values\": {\n"
                + "        \"values\": \"values\"\n"
                + "      }\n"
                + "    },\n"
                + "    \"email\": \"email\",\n"
                + "    \"favorite-number\": 1,\n"
                + "    \"numbers\": [\n"
                + "      1,\n"
                + "      1\n"
                + "    ],\n"
                + "    \"strings\": {\n"
                + "      \"strings\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
                + "    }\n"
                + "  },\n"
                + "  {\n"
                + "    \"name\": \"name\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"tags\": [\n"
                + "      \"tags\",\n"
                + "      \"tags\"\n"
                + "    ],\n"
                + "    \"metadata\": {\n"
                + "      \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "      \"avatar\": \"avatar\",\n"
                + "      \"activated\": true,\n"
                + "      \"status\": {\n"
                + "        \"type\": \"active\"\n"
                + "      },\n"
                + "      \"values\": {\n"
                + "        \"values\": \"values\"\n"
                + "      }\n"
                + "    },\n"
                + "    \"email\": \"email\",\n"
                + "    \"favorite-number\": 1,\n"
                + "    \"numbers\": [\n"
                + "      1,\n"
                + "      1\n"
                + "    ],\n"
                + "    \"strings\": {\n"
                + "      \"strings\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
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
    public void testCreateUser() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"name\":\"name\",\"id\":\"id\",\"tags\":[\"tags\",\"tags\"],\"metadata\":{\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\",\"avatar\":\"avatar\",\"activated\":true,\"status\":{\"type\":\"active\"},\"values\":{\"values\":\"values\"}},\"email\":\"email\",\"favorite-number\":1,\"numbers\":[1,1],\"strings\":{\"strings\":{\"key\":\"value\"}}}"));
        User response = client.nullable()
                .createUser(CreateUserRequest.builder()
                        .username("username")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .metadata(Metadata.builder()
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .status(Status.active())
                                .avatar("avatar")
                                .activated(true)
                                .values(new HashMap<String, Optional<String>>() {
                                    {
                                        put("values", Optional.of("values"));
                                    }
                                })
                                .build())
                        .avatar("avatar")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"username\": \"username\",\n"
                + "  \"tags\": [\n"
                + "    \"tags\",\n"
                + "    \"tags\"\n"
                + "  ],\n"
                + "  \"metadata\": {\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"avatar\": \"avatar\",\n"
                + "    \"activated\": true,\n"
                + "    \"status\": {\n"
                + "      \"type\": \"active\"\n"
                + "    },\n"
                + "    \"values\": {\n"
                + "      \"values\": \"values\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"avatar\": \"avatar\"\n"
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
                + "  \"name\": \"name\",\n"
                + "  \"id\": \"id\",\n"
                + "  \"tags\": [\n"
                + "    \"tags\",\n"
                + "    \"tags\"\n"
                + "  ],\n"
                + "  \"metadata\": {\n"
                + "    \"createdAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"updatedAt\": \"2024-01-15T09:30:00Z\",\n"
                + "    \"avatar\": \"avatar\",\n"
                + "    \"activated\": true,\n"
                + "    \"status\": {\n"
                + "      \"type\": \"active\"\n"
                + "    },\n"
                + "    \"values\": {\n"
                + "      \"values\": \"values\"\n"
                + "    }\n"
                + "  },\n"
                + "  \"email\": \"email\",\n"
                + "  \"favorite-number\": 1,\n"
                + "  \"numbers\": [\n"
                + "    1,\n"
                + "    1\n"
                + "  ],\n"
                + "  \"strings\": {\n"
                + "    \"strings\": {\n"
                + "      \"key\": \"value\"\n"
                + "    }\n"
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
    public void testDeleteUser() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("true"));
        Boolean response = client.nullable()
                .deleteUser(DeleteUserRequest.builder().username("xy").build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("DELETE", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "{\n" + "  \"username\": \"xy\"\n" + "}";
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
        String expectedResponseBody = "" + "true";
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
