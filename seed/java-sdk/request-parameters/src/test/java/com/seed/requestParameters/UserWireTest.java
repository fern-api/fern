package com.seed.requestParameters;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.requestParameters.core.ObjectMappers;
import com.seed.requestParameters.resources.user.requests.CreateUsernameReferencedRequest;
import com.seed.requestParameters.resources.user.requests.CreateUsernameRequest;
import com.seed.requestParameters.resources.user.requests.GetUsersRequest;
import com.seed.requestParameters.resources.user.types.CreateUsernameBody;
import com.seed.requestParameters.resources.user.types.NestedUser;
import com.seed.requestParameters.resources.user.types.User;
import java.math.BigInteger;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class UserWireTest {
    private MockWebServer server;
    private SeedRequestParametersClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedRequestParametersClient.builder()
                .url(server.url("/").toString())
                .build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testCreateUsername() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.user()
                .createUsername(CreateUsernameRequest.builder()
                        .tags(Arrays.asList("tags", "tags"))
                        .username("username")
                        .password("password")
                        .name("test")
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"username\": \"username\",\n"
                + "  \"password\": \"password\",\n"
                + "  \"name\": \"test\"\n"
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
    }

    @Test
    public void testCreateUsernameWithReferencedType() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.user()
                .createUsernameWithReferencedType(CreateUsernameReferencedRequest.builder()
                        .tags(Arrays.asList("tags", "tags"))
                        .body(CreateUsernameBody.builder()
                                .username("username")
                                .password("password")
                                .name("test")
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
                + "  \"password\": \"password\",\n"
                + "  \"name\": \"test\"\n"
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
    }

    @Test
    public void testCreateUsernameOptional() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.user().createUsernameOptional(Optional.of(Optional.empty()));
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "{}";
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
    }

    @Test
    public void testGetUsername() throws Exception {
        server.enqueue(
                new MockResponse().setResponseCode(200).setBody("{\"name\":\"name\",\"tags\":[\"tags\",\"tags\"]}"));
        User response = client.user()
                .getUsername(GetUsersRequest.builder()
                        .limit(1)
                        .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .date("2023-01-15")
                        .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .bytes("SGVsbG8gd29ybGQh".getBytes())
                        .user(User.builder()
                                .name("name")
                                .tags(Arrays.asList("tags", "tags"))
                                .build())
                        .userList(Arrays.asList(
                                User.builder()
                                        .name("name")
                                        .tags(Arrays.asList("tags", "tags"))
                                        .build(),
                                User.builder()
                                        .name("name")
                                        .tags(Arrays.asList("tags", "tags"))
                                        .build()))
                        .keyValue(new HashMap<String, String>() {
                            {
                                put("keyValue", "keyValue");
                            }
                        })
                        .nestedUser(NestedUser.builder()
                                .name("name")
                                .user(User.builder()
                                        .name("name")
                                        .tags(Arrays.asList("tags", "tags"))
                                        .build())
                                .build())
                        .excludeUser(Arrays.asList(User.builder()
                                .name("name")
                                .tags(Arrays.asList("tags", "tags"))
                                .build()))
                        .filter(Arrays.asList("filter"))
                        .longParam(1000000L)
                        .bigIntParam(new BigInteger("1000000"))
                        .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .optionalString("optionalString")
                        .optionalUser(User.builder()
                                .name("name")
                                .tags(Arrays.asList("tags", "tags"))
                                .build())
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"name\": \"name\",\n"
                + "  \"tags\": [\n"
                + "    \"tags\",\n"
                + "    \"tags\"\n"
                + "  ]\n"
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
}
