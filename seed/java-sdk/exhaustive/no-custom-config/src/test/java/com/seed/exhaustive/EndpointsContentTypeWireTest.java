package com.seed.exhaustive;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.exhaustive.core.ObjectMappers;
import com.seed.exhaustive.resources.types.object.types.ObjectWithOptionalField;
import java.math.BigInteger;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class EndpointsContentTypeWireTest {
    private MockWebServer server;
    private SeedExhaustiveClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedExhaustiveClient.builder()
                .url(server.url("/").toString())
                .token("test-token")
                .build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testPostJsonPatchContentType() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.endpoints()
                .contentType()
                .postJsonPatchContentType(ObjectWithOptionalField.builder()
                        .string("string")
                        .integer(1)
                        .long_(1000000L)
                        .double_(1.1)
                        .bool(true)
                        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .date("2023-01-15")
                        .uuid(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .base64("SGVsbG8gd29ybGQh".getBytes())
                        .list(Optional.of(Arrays.asList("list", "list")))
                        .set(new HashSet<String>(Arrays.asList("set")))
                        .map(new HashMap<Integer, String>() {
                            {
                                put(1, "map");
                            }
                        })
                        .bigint(new BigInteger("1000000"))
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"string\": \"string\",\n"
                + "  \"integer\": 1,\n"
                + "  \"long\": 1000000,\n"
                + "  \"double\": 1.1,\n"
                + "  \"bool\": true,\n"
                + "  \"datetime\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"date\": \"2023-01-15\",\n"
                + "  \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
                + "  \"base64\": \"SGVsbG8gd29ybGQh\",\n"
                + "  \"list\": [\n"
                + "    \"list\",\n"
                + "    \"list\"\n"
                + "  ],\n"
                + "  \"set\": [\n"
                + "    \"set\"\n"
                + "  ],\n"
                + "  \"map\": {\n"
                + "    \"1\": \"map\"\n"
                + "  },\n"
                + "  \"bigint\": \"1000000\"\n"
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
    }

    @Test
    public void testPostJsonPatchContentWithCharsetType() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.endpoints()
                .contentType()
                .postJsonPatchContentWithCharsetType(ObjectWithOptionalField.builder()
                        .string("string")
                        .integer(1)
                        .long_(1000000L)
                        .double_(1.1)
                        .bool(true)
                        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .date("2023-01-15")
                        .uuid(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .base64("SGVsbG8gd29ybGQh".getBytes())
                        .list(Optional.of(Arrays.asList("list", "list")))
                        .set(new HashSet<String>(Arrays.asList("set")))
                        .map(new HashMap<Integer, String>() {
                            {
                                put(1, "map");
                            }
                        })
                        .bigint(new BigInteger("1000000"))
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"string\": \"string\",\n"
                + "  \"integer\": 1,\n"
                + "  \"long\": 1000000,\n"
                + "  \"double\": 1.1,\n"
                + "  \"bool\": true,\n"
                + "  \"datetime\": \"2024-01-15T09:30:00Z\",\n"
                + "  \"date\": \"2023-01-15\",\n"
                + "  \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
                + "  \"base64\": \"SGVsbG8gd29ybGQh\",\n"
                + "  \"list\": [\n"
                + "    \"list\",\n"
                + "    \"list\"\n"
                + "  ],\n"
                + "  \"set\": [\n"
                + "    \"set\"\n"
                + "  ],\n"
                + "  \"map\": {\n"
                + "    \"1\": \"map\"\n"
                + "  },\n"
                + "  \"bigint\": \"1000000\"\n"
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
