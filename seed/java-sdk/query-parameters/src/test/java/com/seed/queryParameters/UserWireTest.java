package com.seed.queryParameters;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.queryParameters.SeedQueryParametersClient;
import com.seed.queryParameters.core.ObjectMappers;
import com.seed.queryParameters.resources.user.requests.GetUsersRequest;
import com.seed.queryParameters.resources.user.types.NestedUser;
import com.seed.queryParameters.resources.user.types.User;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
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
    private SeedQueryParametersClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedQueryParametersClient.builder()
            .url(server.url("/").toString())
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testGetUsername() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"name\":\"name\",\"tags\":[\"tags\",\"tags\"]}"));
        User response = client.user().getUsername(
            GetUsersRequest
                .builder()
                .limit(1)
                .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                .date("2023-01-15")
                .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .bytes("SGVsbG8gd29ybGQh".getBytes())
                .user(
                    User
                        .builder()
                        .name("name")
                        .tags(
                            Arrays.asList("tags", "tags")
                        )
                        .build()
                )
                .userList(
                    Arrays.asList(
                        User
                            .builder()
                            .name("name")
                            .tags(
                                Arrays.asList("tags", "tags")
                            )
                            .build(),
                        User
                            .builder()
                            .name("name")
                            .tags(
                                Arrays.asList("tags", "tags")
                            )
                            .build()
                    )
                )
                .keyValue(
                    new HashMap<String, String>() {{
                        put("keyValue", "keyValue");
                    }}
                )
                .nestedUser(
                    NestedUser
                        .builder()
                        .name("name")
                        .user(
                            User
                                .builder()
                                .name("name")
                                .tags(
                                    Arrays.asList("tags", "tags")
                                )
                                .build()
                        )
                        .build()
                )
                .excludeUser(
                    Arrays.asList(
                        User
                            .builder()
                            .name("name")
                            .tags(
                                Arrays.asList("tags", "tags")
                            )
                            .build()
                    )
                )
                .filter(
                    Arrays.asList("filter")
                )
                .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .optionalString("optionalString")
                .optionalUser(
                    User
                        .builder()
                        .name("name")
                        .tags(
                            Arrays.asList("tags", "tags")
                        )
                        .build()
                )
                .build()
        );
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
