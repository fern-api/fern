package com.seed.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.api.core.ObjectMappers;
import com.seed.api.requests.SearchRequest;
import com.seed.api.types.NestedUser;
import com.seed.api.types.SearchRequestNeighborRequired;
import com.seed.api.types.SearchResponse;
import com.seed.api.types.User;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
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
    private SeedApiClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedApiClient.builder().url(server.url("/").toString()).build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testSearch() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{\"results\":[\"results\",\"results\"]}"));
        SearchResponse response = client.search(SearchRequest.builder()
                .limit(1)
                .id("id")
                .date("date")
                .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .bytes("bytes")
                .user(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build())
                .userList(Arrays.asList(Optional.of(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build())))
                .excludeUser(Arrays.asList(Optional.of(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build())))
                .filter(Arrays.asList(Optional.of("filter")))
                .neighborRequired(SearchRequestNeighborRequired.of(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build()))
                .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .keyValue(new HashMap<String, Optional<String>>() {
                    {
                        put("keyValue", Optional.of("keyValue"));
                    }
                })
                .optionalString("optionalString")
                .nestedUser(NestedUser.builder()
                        .name("name")
                        .user(User.builder()
                                .name("name")
                                .tags(Optional.of(Arrays.asList("tags", "tags")))
                                .build())
                        .build())
                .optionalUser(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build())
                .neighbor(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build())
                .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody =
                "" + "{\n" + "  \"results\": [\n" + "    \"results\",\n" + "    \"results\"\n" + "  ]\n" + "}";
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
